'use strict';

const jsonwebtoken = require('jsonwebtoken');

const ghApi = require('./gh-api.js');

const getAppToken = ({ appId, privateKey }) =>
  Promise.resolve(
    jsonwebtoken.sign({}, privateKey, {
      algorithm: 'RS256',
      expiresIn: '9m',
      issuer: String(appId),
    })
  );

const getAppInstallationToken = ({ installationId, appToken }) =>
  ghApi({
    method: 'post',
    url: `installations/${installationId}/access_tokens`,
    token: appToken,
  }).then(response => response.data.token);

module.exports = {
  getAppToken,
  getAppInstallationToken,
};
