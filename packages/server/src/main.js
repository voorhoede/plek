'use strict';

const dotenv = require('dotenv-safe').config();
const fs = require('fs');
const memoize = require('lodash.memoize');
const micro = require('micro');
const raven = require('raven');

const ghApi = require('./gh-api.js');
const ghAuth = require('./gh-auth.js');

raven
  .config('https://032b525989a645b991503e629465f8c4@sentry.io/1260219')
  .install();

const server = micro(async (request, result) => {
  const {
    name,
    ciEnv: { repo, commit },
    commitStatus,
  } = await micro.json(request);

  ghAuth
    .getAppToken({
      appId: process.env.APP_ID,
      privateKey: String(Buffer.from(process.env.GH_PRIVATE_KEY, 'base64')),
    })
    .then(appToken =>
      Promise.all([appToken, getInstallation({ appToken, owner: repo.owner })])
    )
    .then(([appToken, installation]) =>
      ghAuth.getAppInstallationToken({
        installationId: installation.id,
        appToken,
      })
    )
    .then(token =>
      updateGithubStatus({
        name,
        body: commitStatus,
        integrationEnv: {
          repo,
          commit,
        },
        token,
      })
    )

  return '';
});

const getInstallation = memoize(
  ({ appToken, owner }) =>
    ghApi({
      url: 'app/installations?per_page=100',
      token: appToken,
    })
      .then(({ data }) =>
        data.find(installation => installation.account.login === owner)
      ),
  ({ owner }) => owner
);

const updateGithubStatus = ({
  name,
  body,
  integrationEnv: { repo, commit },
  token,
}) =>
  ghApi({
    method: 'post',
    url: `repos/${repo.owner}/${repo.name}/statuses/${commit}`,
    token,
    data: {
      ...body,
      context: `plek${name ? `/${name}` : ''}`,
    },
  })
    .then(response => response.data.state);

server.listen(process.env.PORT || 0);
console.info(`Server launched at http://localhost:${server.address().port}`);

['SIGINT', 'SIGTERM'].forEach(function(signal) {
  process.on(signal, function() {
    console.info('Closing server');
    server.close(process.exit);
  });
});

process.on('unhandledRejection', error => {
  console.error(error);
  raven.captureException(error);
});

module.exports = server;
