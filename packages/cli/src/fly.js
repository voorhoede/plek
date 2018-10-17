'use strict';

const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const axios = require('axios');
const glob = require('glob');
const yaml = require('js-yaml');
const pako = require('pako');
const tar = require('tar');
const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const flyAxios = axios.create({
  baseURL: 'https://fly.io',
  headers: { Authorization: `Bearer ${process.env.FLY_TOKEN}` },
});

const getWebpackConfig = () => {
  let config;

  const defaultPathToWebpackConfig = path.join(
    process.cwd(),
    'webpack.fly.config.js'
  );
  if (fs.existsSync(defaultPathToWebpackConfig)) {
    config = require(defaultPathToWebpackConfig);
  } else {
    config = {
      entry: `${process.cwd()}/index.js`,
      resolve: {
        extensions: ['.js'],
      },
    };
  }
  config.entry = config.entry || `${process.cwd()}/index.js`;
  config.resolve = config.resolve || {
    extensions: ['.js'],
  };
  config.devtool = 'source-map';
  config.output = {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), '.fly/build'),
    hashFunction: 'sha1',
    hashDigestLength: 40,
    sourceMapFilename: 'bundle.map.json',
  };

  const v8EnvPath = path.resolve(
    path.resolve(path.dirname(require.resolve('@fly/v8env')), '..'),
    'lib'
  );

  config.resolve = {
    alias: {
      ...config.resolve.alias,
      '@fly/image': v8EnvPath + '/fly/image',
      '@fly/proxy': v8EnvPath + '/fly/proxy',
      '@fly/data': v8EnvPath + '/fly/data',
      '@fly/cache': v8EnvPath + '/fly/cache',
      '@fly/static': v8EnvPath + '/fly/static',
      '@fly/fetch': v8EnvPath + '/fly/fetch',
    },
    ...config.resolve,
  };

  config.plugins = config.plugins || [];
  config.plugins.push(
    new uglifyjsWebpackPlugin({
      parallel: true,
      sourceMap: true,
      uglifyOptions: {
        output: { ascii_only: true },
        mangle: false,
      },
    })
  );

  return config;
};

const buildApp = () =>
  promisify(webpack)(getWebpackConfig()).then(stats => {
    if (stats.hasErrors()) {
      return Promise.reject(stats.toJson().errors);
    }

    console.info(`Compiled app in ${stats.endTime - stats.startTime}ms`);

    return Promise.resolve();
  });

const createTarball = () => {
  const configPath = fs.existsSync(path.resolve('.fly', '.fly.yml'))
    ? '.fly/.fly.yml'
    : '.fly.yml';

  const entries = [
    configPath,
    ...glob.sync('.fly/*/**.{js,json}', { cwd: process.cwd() }),
    ...yaml
      .safeLoad(fs.readFileSync(path.join(process.cwd(), '.fly.yml')))
      .files.reduce(
        (files, file) => files.push(...glob.sync(file)) && files,
        []
      ),
  ].filter(file => fs.existsSync(path.resolve(process.cwd(), file)));

  return tar.create(
    { portable: true, follow: true, file: '.fly/bundle.tar' },
    entries
  );
};

const upload = ({ appName, stage }) => {
  const bundle = fs.readFileSync(
    path.resolve(process.cwd(), '.fly/bundle.tar')
  );
  const gzippedBundle = pako.gzip(bundle);
  const bundleHash = createHash('sha1').update(bundle);

  return flyAxios.post(`/api/v1/apps/${appName}/releases`, gzippedBundle, {
    params: {
      sha1: bundleHash.digest('hex'),
      env: stage,
    },
    headers: {
      'Content-Type': 'application/x-tar',
      'Content-Length': gzippedBundle.byteLength,
      'Content-Encoding': 'gzip',
    },
    maxContentLength: 100 * 1024 * 1024,
    timeout: 120 * 1000,
  });
};

const createApp = name => {
  return flyAxios.post('/api/v1/apps', { data: { attributes: { name } } });
};

const deleteApp = name => flyAxios.delete(`/api/v1/apps/${name}`);

const getApps = () =>
  flyAxios.get('/api/v1/apps').then(({ data }) => data.data);

const getDeployments = appName =>
  flyAxios
    .get(`/api/v1/apps/${appName}/releases`)
    .then(({ data }) => data.data);

const isPrName = name => Boolean(name.match(/pr-\d+/));

const getPrApps = apps => apps.filter(({ id }) => isPrName(id));

const millisecondsToDays = ms => ms / 1000 / 60 / 60 / 24;

module.exports = {
  cleanup: () => () =>
    getApps()
      .then(getPrApps)
      .then(prApps =>
        Promise.all([
          prApps,
          Promise.all(prApps.map(({ id }) => getDeployments(id))),
        ])
      )
      .then(([prApps, appDeployments]) =>
        prApps
          .reduce((deployedPrApps, prApp, index) => {
            if (appDeployments[index][0])
              deployedPrApps.push({
                id: prApp.id,
                created: appDeployments[index][0].attributes.created_at,
              });
            return deployedPrApps;
          }, [])
          .filter(
            deployedPrApp =>
              millisecondsToDays(
                Date.now() - Date.parse(deployedPrApp.created)
              ) > 30
          )
      )
      .then(deployedPrApps => deployedPrApps.map(({ id }) => deleteApp(id))),
  deploy: ({ appName, stage }) => () =>
    buildApp()
      .then(createTarball)
      .then(() => upload({ appName, stage }))
      .then(() => process.env.DOMAIN),
  alias: ({ appName }) => {
    return createApp(appName)
      .catch(({ response }) => {
        if (
          response.data.errors &&
          response.data.errors.find(
            error =>
              error.detail === 'has already been taken' &&
              error.source.pointer === '/data/attributes/name'
          )
        ) {
          return Promise.resolve(appName);
        }
        return Promise.reject(response);
      })
      .then(() => appName);
  },
  getPrApps,
};
