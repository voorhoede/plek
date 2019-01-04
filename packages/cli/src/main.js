#!/usr/bin/env node
'use strict';

const axios = require('axios');
const getCiEnv = require('get-ci-env');
const path = require('path');
const raven = require('raven');
const signale = require('signale');
const yargs = require('yargs');

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
      name: path.parse(process.cwd()).name,
      ...data,
    }),
});

const cleanupFlow = command => ciEnv => {
  signale.start('cleaning up...');
  backendAxios({
    data: {
      ciEnv,
      flow: 'cleanup',
      state: 'pending',
    },
  });

  return command().then(() => {
    signale.success('cleaned up old domains & deployments');
  });
};

const deployFlow = command => ciEnv => {
  signale.start('deploying...');
  backendAxios({
    data: {
      ciEnv,
      flow: 'deploy',
      state: 'pending',
    },
  });

  return command().then(url => {
    backendAxios({
      data: {
        ciEnv,
        flow: 'deploy',
        state: 'success',
        targetUrl: url,
      },
    });

    signale.success(`deployed to ${url}`);
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
  signale.start('aliasing domain...');

  backendAxios({
    data: {
      ciEnv,
      flow: 'alias',
      state: 'pending',
    },
  });

  return command().then(output => {
    backendAxios({
      data: {
        ciEnv,
        flow: 'alias',
        state: 'success',
        targetUrl: `https://${process.env.DOMAIN}`,
      },
    });

    signale.success(output);
    return output;
  });
};

const [cleanup, deploy, alias] = [cleanupFlow, deployFlow, aliasFlow].map(
  flow => (...args) => getCiEnv().then(flow(...args))
);

yargs
  .usage('$0 <cmd> [args]')
  .demandCommand(1)
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .example('$0 now myproject.now.sh --app myproject -- --public');

yargs.command(
  'cleanup <command>',
  'Run cleanup step with custom command',
  {},
  ({ command }) => {
    cleanup(() => exec(command));
  }
);

yargs.command(
  'deploy <command>',
  'Run deploy step with custom command',
  {},
  ({ command }) => {
    deploy(() => exec(command).then(getStdout));
  }
);

yargs.command(
  'alias <command> <domain>',
  'Run alias step with custom command',
  {},
  ({ command, domain }) => {
    alias(() => exec(command), domain);
  }
);

yargs.command(
  'now <domain>',
  `Use ZEIT Now, pass through flags to the Now CLI after the command seperated with "--",`,
  {
    app: {
      alias: 'a',
      describe: 'Zeit Now app name',
      type: 'string',
      nargs: 1,
      demandOption: true,
    },
    team: {
      alias: 't',
      describe: 'Zeit team name',
      type: 'string',
      nargs: 1,
      default: '',
      coerce: team => ({
        flag: team ? `--team ${team}` : '',
        slug: team,
      }),
    },
    nowFlags: {
      skipValidation: true,
      hidden: true,
    },
  },
  ({ domain, app, team, _: nowFlags }) => {
    if (!process.env.NOW_TOKEN)
      throw Error('Missing NOW_TOKEN environment variable.');

    nowFlags = nowFlags.slice(1).join(' ');

    cleanup(now.cleanup({ app, teamSlug: team.slug, domain })).then(
      deploy(now.deploy({ nowFlags, app, teamFlag: team.flag })).then(url =>
        alias(now.alias({ url, teamFlag: team.flag }), domain)
      )
    );
  }
);

yargs.command(
  'fly <appName>',
  'Use Fly',
  {
    stage: {
      alias: 's',
      describe: 'Environment stage to use',
      type: 'string',
      nargs: 1,
      default: 'production',
    },
  },
  ({ appName, stage }) => {
    if (!process.env.FLY_TOKEN)
      throw Error('Missing FLY_TOKEN environment variable.');

    cleanup(fly.cleanup()).then(
      alias(
        () =>
          fly
            .alias({ appName: process.env.DOMAIN.split('.')[0] })
            .then(appName => deploy(fly.deploy({ appName, stage }))),
        `${appName}.edgeapp.net`
      )
    );
  }
);

yargs.parse(process.argv.slice(2));

process.title = 'plek';
process.on('unhandledRejection', fatalError);
