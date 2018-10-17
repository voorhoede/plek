'use strict';

const test = require('ava');
const { exec } = require('child_process');
const dotenv = require('dotenv-safe');
const { join } = require('path');
const { promisify } = require('util');

const server = require('../packages/server/src/server.js');
const getStdout = require('../packages/cli/src/get-stdout.js');

dotenv.config();
dotenv.config({ path: '../packages/server/.env' });

const getPackagePath = name => join(__dirname, '..', 'packages', name);

test.before(t => {
  process.env.CIRCLECI = 'true';
  process.env.CIRCLE_BRANCH = 'master';
  process.env.CIRCLE_SHA1 = '79f0bd75b55ec306e2bb6213a72b2f468dbc099e';
  process.env.CIRCLE_PROJECT_USERNAME = 'voorhoede';
  process.env.CIRCLE_PROJECT_REPONAME = 'plek';

  t.context.cliPath = require.resolve(getPackagePath('cli'));
});

test.beforeEach('start server', t => {
  const testServer = server.launch();

  process.env.BACKEND_URL = `http://localhost:${testServer.address().port}`;
  t.context.testServer = testServer;
});

test.afterEach.always('stop server', t => {
  t.context.testServer.close();
});

test.serial('Main flow using service ZEIT Now', t => {
  const subCommand = `now plek-integration-test.now.sh --team devoorhoede --config '--static --public' --app plek-test`;

  return promisify(exec)(`${t.context.cliPath} ${subCommand}`)
    .then(getStdout)
    .then(t.truthy);
});

test.serial('Main flow using service Fly', t => {
  const subCommand = `fly plek-test`;

  return promisify(exec)(`${t.context.cliPath} ${subCommand}`)
    .then(getStdout)
    .then(t.truthy);
});
