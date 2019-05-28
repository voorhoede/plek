'use strict';

const signale = require('signale');

module.exports = error => {
  signale.error(error);
  process.exit(1);
};
