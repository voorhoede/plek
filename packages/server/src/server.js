'use strict';

const memoize = require('lodash.memoize');
const micro = require('micro');

const ghApi = require('./gh-api.js');
const ghAuth = require('./gh-auth.js');

const createInstance = () =>
  micro(async (request, response) => {
    if (request.url === '/events') return micro.send(response, 200);

    const {
      name,
      ciEnv: { repo, commit },
      flow,
      state,
      targetUrl = '',
    } = await micro.json(request);

    ghAuth
      .getAppToken({
        appId: process.env.GITHUB_APP_IDENTIFIER,
        privateKey: String(
          Buffer.from(process.env.GITHUB_PRIVATE_KEY, 'base64')
        ),
      })
      .then(appToken =>
        Promise.all([appToken, getInstallation({ appToken, repo })])
      )
      .then(([appToken, installation]) =>
        ghAuth.getAppInstallationToken({
          installationId: installation.id,
          appToken,
        })
      )
      .then(token => [
        token,
        createGithubStatus({
          name,
          flow,
          state,
          targetUrl,
        }),
      ])
      .then(([token, status]) =>
        updateGithubStatus({
          status,
          repo,
          commit,
          token,
        })
      );

    return micro.send(response, 200);
  });

const getInstallation = memoize(
  ({ appToken, repo }) =>
    ghApi({
      url: `repos/${repo.owner}/${repo.name}/installation`,
      token: appToken,
    }).then(({ data }) => data),
  ({ repo }) => `${repo.owner}/${repo.name}`
);

const createGithubStatus = ({ name, flow, state, targetUrl }) => {
  const statusDescriptions = {
    cleanup: {
      pending: 'Cleaning up...',
    },
    deploy: {
      pending: 'Deploying...',
      success: 'Deployed!',
    },
    alias: {
      pending: 'Wiring up domains...',
      success: 'Deployed & aliased!',
    },
  };

  return {
    state,
    target_url: targetUrl,
    description: statusDescriptions[flow][state],
    context: `plek${name ? `/${name}` : ''}`,
  };
};

const updateGithubStatus = ({ status, repo, commit, token }) =>
  ghApi({
    method: 'post',
    url: `repos/${repo.owner}/${repo.name}/statuses/${commit}`,
    token,
    data: status,
  }).then(response => response.data.state);

module.exports = {
  launch: ({ port = process.env.PORT || 0 } = {}) => {
    const instance = createInstance();

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        instance.close(process.exit);
      });
    });

    return instance.listen(port, () => {
      if (process.env.NODE_ENV !== 'test')
        console.info(
          `Server launched at http://localhost:${instance.address().port}`
        );
    });
  },
};
