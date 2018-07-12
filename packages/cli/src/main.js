#!/usr/bin/env node
'use strict';

const axios = require('axios');
const commander = require('commander');
const getCiEnv = require('get-ci-env');
const path = require('path');

const exec = require('./exec.js');
const getStdout = require('./get-stdout.js');

// Service specific dependencies
const importLazy = require('import-lazy')(require);
const now = importLazy('./now.js');

const hasSubdomain = domain => domain.split('.').length > 2;

const backendAxios = axios.create({
  url: process.env.BACKEND_URL || 'https://plek-server.now.sh/',
  method: 'post',
  transformRequest: data => JSON.stringify({
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
        description: 'Deploying, hang on tight...',
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

  return command().then(std => {
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

    console.info(std);
    return std;
  });
};

const logFatalError = error => {
  console.error(error);
  process.exit(1);
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

    cleanup(now.cleanup({ app, teamSlug: team.slug })).then(
      deploy(now.deploy({ config, app, teamFlag: team.flag })).then(url =>
        alias(now.alias({ url, teamFlag: team.flag }), domain)
      )
    );
  });

commander.parse(process.argv);

process.title = 'plek';
process.on('unhandledRejection', logFatalError);
