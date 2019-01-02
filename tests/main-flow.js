'use strict';

const test = require('ava');
const { exec } = require('child_process');
const dotenv = require('dotenv-safe');
const path = require('path');
const { promisify } = require('util');

const server = require('../packages/server/src/server.js');
const getStdout = require('../packages/cli/src/get-stdout.js');

dotenv.config({ path: './tests/.env', example: './tests/.env.example' });
dotenv.config({
  path: './packages/server/.env',
  example: './packages/server/.env.example',
});

test.before(t => {
  process.chdir('./tests');
  process.env.CIRCLECI = 'true';
  process.env.CIRCLE_BRANCH = 'master';
  process.env.CIRCLE_SHA1 = '9260fa23672111c63db08837b1cd0154f0aa297f';
  process.env.CIRCLE_PROJECT_USERNAME = 'voorhoede';
  process.env.CIRCLE_PROJECT_REPONAME = 'plek';

  t.context.cliPath = require.resolve(path.join('..', 'packages', 'cli'));
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
  const subCommand = `now plek-integration-test.now.sh --team devoorhoede --app plek-test -- --public`;

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
