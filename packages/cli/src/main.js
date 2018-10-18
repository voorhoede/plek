#!/usr/bin/env node
'use strict';

const axios = require('axios');
const commander = require('commander');
const getCiEnv = require('get-ci-env');
const path = require('path');
const raven = require('raven');

const exec = require('./exec.js');
const fatalError = require('./fatal-error.js');
const getStdout = require('./get-stdout.js');

// Service specific dependencies
const importLazy = require('import-lazy')(require);
const fly = importLazy('./fly.js');
const now = importLazy('./now.js');

raven
  .config('https://7e1cc5b59bf742d587a7651bedcd95a8@sentry.io/1260110')
  .install();

const hasSubdomain = domain => domain.split('.').length > 2;

const backendAxios = axios.create({
  url: process.env.BACKEND_URL || 'https://plek-server.now.sh/',
  method: 'post',
  transformRequest: data =>
    JSON.stringify({
      ...data,
      name: path.parse(process.cwd()).name,
    }),
});

const cleanupFlow = command => ciEnv => {
  backendAxios({
    data: {
      ciEnv,
      commitStatus: {
        description: 'Cleaning up, soapy...',
        state: 'pending',
      },
    },
  });

  return command();
};

const deployFlow = command => ciEnv => {
  backendAxios({
    data: {
      ciEnv,
      commitStatus: {
        description: 'Deploying, hang on...',
        state: 'pending',
      },
    },
  });

  return command().then(url => {
    backendAxios({
      data: {
        ciEnv,
        commitStatus: {
          description: 'Deployed!',
          state: 'success',
          target_url: url,
        },
      },
    });

    console.info(url);
    return url;
  });
};

const aliasFlow = (command, domain) => ciEnv => {
  const domainDivider = hasSubdomain(domain) ? '-' : '.';

  if (ciEnv.pr) {
    process.env.DOMAIN = `pr-${ciEnv.pr.number}${domainDivider}${domain}`;
  } else if (ciEnv.branch === 'master') {
    process.env.DOMAIN = domain;
  } else {
    return Promise.resolve();
  }

  backendAxios({
    data: {
      ciEnv,
      commitStatus: {
        description: 'Wiring up domains, untangling...',
        state: 'pending',
      },
    },
  });

  return command().then(output => {
    backendAxios({
      data: {
        ciEnv,
        commitStatus: {
          description: 'Deployed & aliased!',
          state: 'success',
          target_url: `https://${process.env.DOMAIN}`,
        },
      },
    });

    console.info(output);
    return output;
  });
};

const [cleanup, deploy, alias] = [cleanupFlow, deployFlow, aliasFlow].map(
  flow => (...args) => getCiEnv().then(flow(...args))
);

commander.command('cleanup <command>').action(command => {
  cleanup(() => exec(command));
});

commander.command('deploy <command>').action(command => {
  deploy(() => exec(command).then(getStdout));
});

commander.command('alias <command> <domain>').action((command, domain) => {
  alias(() => exec(command), domain);
});

commander
  .command('now <domain>')
  .option('-a, --app <app>', 'Zeit Now app name')
  .option('-c, --config <config>', 'Zeit Now CLI configuration flags', '')
  .option('--team [team]', 'Zeit team name', team => ({
    flag: `--team ${team}`,
    slug: team,
  }))
  .action((domain, { config, app, team = {} }) => {
    if (!app) throw Error('Missing Zeit Now app name argument');
    if (!process.env.NOW_TOKEN)
      throw new Error('Missing NOW_TOKEN environment variable.');

    team = {
      flag: team.flag || '',
      slug: team.slug || '',
    };

    cleanup(now.cleanup({ app, teamSlug: team.slug, domain })).then(
      deploy(now.deploy({ config, app, teamFlag: team.flag })).then(url =>
        alias(now.alias({ url, teamFlag: team.flag }), domain)
      )
    );
  });

commander
  .command('fly <appName>')
  .option('-s, --stage [stage]', 'Environment stage to use', 'production')
  .action((appName, { stage }) => {
    cleanup(fly.cleanup()).then(
      alias(
        () =>
          fly
            .alias({ appName: process.env.DOMAIN.split('.')[0] })
            .then(appName => deploy(fly.deploy({ appName, stage }))),
        `${appName}.edgeapp.net`
      )
    );
  });

commander.parse(process.argv);

process.title = 'plek';
process.on('unhandledRejection', fatalError);
