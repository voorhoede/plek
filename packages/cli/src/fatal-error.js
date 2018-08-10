'use strict';

const raven = require('raven');

module.exports = error => {
  console.error(error);
  raven.captureException(error);
};
