#!/usr/bin/env node
'use strict';

const axios = require('axios');
const commander = require('commander');
const getCiEnv = require('get-ci-env');

const exec = require('./exec.js');
const getStdout = require('./get-stdout.js');

// Service specific dependencies
const importLazy = require('import-lazy')(require);
const now = importLazy('./now.js');
const mri = importLazy('mri');

const hasSubdomain = domain => domain.split('.').length > 2;

const backendAxios = axios.create({
  url: process.env.BACKEND_URL || 'https://plek-server.now.sh/',
  method: 'post',
});

const cleanupFlow = ciEnv => command => {
  backendAxios({
    data: {
      ciEnv,
      commitStatus: 'Cleaning up, soapy...',
      state: 'pending',
    },
  });

  return command();
};

const deployFlow = ciEnv => command => {
  backendAxios({
    data: {
      ciEnv,
      commitStatus: 'Deploying, hang on tight...',
      state: 'pending',
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

const aliasFlow = ciEnv => (command, domain) => {
  const domainDivider = hasSubdomain(domain) ? '-' : '.';

  backendAxios({
    data: {
      ciEnv,
      commitStatus: {
        description: 'Wiring up domains, untangling...',
        state: 'pending',
      },
    },
  });

  if (ciEnv.pr) {
    process.env.DOMAIN = `pr-${ciEnv.pr.number}${domainDivider}${domain}`;
  } else if (ciEnv.branch === 'master') {
    process.env.DOMAIN = domain;
  } else {
    return Promise.resolve();
  }

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

getCiEnv().then(ciEnv => {
  const cleanup = cleanupFlow(ciEnv);
  const deploy = deployFlow(ciEnv);
  const alias = aliasFlow(ciEnv);

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
    .command('now <flags> <domain> <app>')
    .action((flags, domain, app) => {
      cleanup(now.cleanup({ app, teamSlug: mri(commander.args).team })).then(
        deploy(now.deploy(flags)).then(url =>
          alias(now.alias(url, flags), domain)
        )
      );
    });
  commander.parse(process.argv);
});

process.title = 'plek';
process.on('unhandledRejection', logFatalError);
