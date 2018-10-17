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
      commitStatus,
    } = await micro.json(request);

    ghAuth
      .getAppToken({
        appId: process.env.APP_ID,
        privateKey: String(Buffer.from(process.env.GH_PRIVATE_KEY, 'base64')),
      })
      .then(appToken =>
        Promise.all([
          appToken,
          getInstallation({ appToken, owner: repo.owner }),
        ])
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
      );

    return micro.send(response, 200);
  });

const getInstallation = memoize(
  ({ appToken, owner }) =>
    ghApi({
      url: 'app/installations?per_page=100',
      token: appToken,
    }).then(({ data }) =>
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
