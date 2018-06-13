'use strict';

const test = require('ava');
const { exec } = require('child_process');
const { join } = require('path');
const { promisify } = require('util');

const getStdout = require('../packages/cli/src/get-stdout.js');

const getPackagePath = name => join(__dirname, '..', 'packages', name);

test('Main flow', t => {
  process.chdir(getPackagePath('server'));
  const server = require(getPackagePath('server'));
  process.chdir(__dirname);

  process.env.CIRCLECI = 'true';
  process.env.CIRCLE_BRANCH = 'master';
  process.env.CIRCLE_SHA1 = '79f0bd75b55ec306e2bb6213a72b2f468dbc099e';
  process.env.CIRCLE_PROJECT_USERNAME = 'voorhoede';
  process.env.CIRCLE_PROJECT_REPONAME = 'plek';
  process.env.BACKEND_URL = `http://localhost:${server.address().port}`;

  process.chdir(__dirname);
  const dotenv = require('dotenv-safe').config();
  const nowCommand = `now plek-integration-test.now.sh --team devoorhoede --config '--static --public' --app plek-test`;

  return promisify(exec)(
    `${require.resolve(getPackagePath('cli'))} ${nowCommand}`
  )
    .then(
      output =>
        new Promise((resolve, reject) => {
          server.close(error => (error ? reject(error) : resolve(output)));
        })
    )
    .then(getStdout)
    .then(t.truthy);
});
