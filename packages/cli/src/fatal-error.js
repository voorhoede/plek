'use strict';

const raven = require('raven');
const signale = require('signale');

module.exports = error => {
  signale.error(error);
  raven.captureException(error, () => {
    process.exit(1);
  });
};
