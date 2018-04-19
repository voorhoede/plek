'use strict';

const axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');

const getAppToken = ({ appId, privateKey }) =>
  Promise.resolve(
    jsonwebtoken.sign({}, privateKey, {
      algorithm: 'RS256',
      expiresIn: '9m',
      issuer: String(appId),
    })
  );

const getAppInstallationToken = ({ installationId, appToken }) =>
  axios({
    url: `installations/${installationId}/access_tokens`,
    method: 'post',
    baseURL: 'https://api.github.com/',
    headers: {
      accept: 'application/vnd.github.machine-man-preview+json',
      authorization: `Bearer ${appToken}`,
    },
  }).then(response => response.data.token);

module.exports = {
  getAppToken,
  getAppInstallationToken,
};
