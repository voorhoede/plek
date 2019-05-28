'use strict';

const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

const axios = require('axios');
const glob = require('glob');
const yaml = require('js-yaml');
const pako = require('pako');
const tar = require('tar');

const { buildApp } = require('@fly/build');

const flyAxios = axios.create({
  baseURL: 'https://fly.io',
  headers: { Authorization: `Bearer ${process.env.FLY_TOKEN}` },
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
    buildApp({
      inputPath: process.cwd(),
      outputPath: path.resolve('.fly/build'),
      uglify: true,
    })
      .then(createTarball)
      .then(() => upload({ appName, stage }))
      .then(() => `https://${process.env.DOMAIN}`),
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
