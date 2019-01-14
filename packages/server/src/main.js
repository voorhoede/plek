'use strict';

const dotenv = require('dotenv-safe');
const raven = require('raven');
const server = require('./server.js');

dotenv.config();

raven
  .config('https://032b525989a645b991503e629465f8c4@sentry.io/1260219')
  .install();

process.on('unhandledRejection', error => {
  console.error(error);
  raven.captureException(error);
});

server.launch();
