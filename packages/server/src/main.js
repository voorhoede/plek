'use strict';

const dotenv = require('dotenv-safe').config();
const fs = require('fs');
const ghGot = require('gh-got');
const micro = require('micro');

const ghAuth = require('./gh-auth.js');

const server = micro(async (request, result) => {
  const { ciEnv: { repo, commit }, commitStatus } = await micro.json(request);

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
        body: commitStatus,
        integrationEnv: {
          repo,
          commit,
        },
        token,
      })
    )
    .catch(console.error);

  return '';
});

const getInstallation = ({ appToken, owner }) =>
  ghGot
    .get('app/installations', {
      headers: {
        accept: 'application/vnd.github.machine-man-preview+json',
        authorization: `Bearer ${appToken}`,
      },
    })
    .then(({ body }) =>
      body.find(installation => installation.account.login === owner)
    );

const updateGithubStatus = ({
  body,
  integrationEnv: { repo, commit },
  token,
}) =>
  ghGot
    .post(`repos/${repo.owner}/${repo.name}/statuses/${commit}`, {
      token,
      body: {
        ...body,
        context: 'plek',
      },
    })
    .then(response => response.body.state);

server.listen(0);
