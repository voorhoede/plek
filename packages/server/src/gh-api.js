'use strict';

const axios = require('axios');

module.exports = ({ token, ...options }) =>
  axios({
    ...options,
    baseURL: 'https://api.github.com/',
    headers: {
      accept: 'application/vnd.github.machine-man-preview+json',
      authorization: `Bearer ${token}`,
    },
  });
