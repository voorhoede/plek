'use strict';

const axios = require('axios');

const exec = require('./exec.js');

const nowBaseCommand = './node_modules/.bin/now --token=$NOW_TOKEN';

const nowAxios = axios.create({
  baseURL: 'https://api.zeit.co/v2/now/',
  headers: { Authorization: `Bearer ${process.env.NOW_TOKEN}` },
});

const millisecondsToDays = ms => ms / 1000 / 60 / 60 / 24;

const getNonAliasedDeployments = ({ deployments, aliases }) =>
  deployments.filter(
    deployment => !aliases.find(alias => alias.deployment.id === deployment.uid)
  );

const getOldAliasedDeployments = ({ deployments, aliases }) =>
  deployments.filter(deployment =>
    aliases.find(
      alias =>
        alias.deployment.id === deployment.uid &&
        millisecondsToDays(Date.now() - deployment.created) > 30
    )
  );

const cleanup = id =>
  Promise.all([
    nowAxios(`/deployments`, { params: { app: id } }),
    nowAxios('/aliases'),
  ])
    .then(([deploymentsResponse, aliasesResponse]) => ({
      deployments: deploymentsResponse.data.deployments,
      aliases: aliasesResponse.data.aliases,
    }))
    .then(deploymentsData =>
      [
        ...getNonAliasedDeployments(deploymentsData),
        ...getOldAliasedDeployments(deploymentsData),
      ].map(({ uid }) => nowAxios.delete(`/deployments/${uid}`))
    );

module.exports = {
  cleanup: id => () => cleanup(id),
  deploy: flags => () =>
    exec(`${nowBaseCommand} deploy ${flags}`).then(
      ({ stdout, stderr }) =>
        stderr && !stderr.includes('Success') ? Promise.reject(stderr) : stdout
    ),
  alias: (url, flags) => () =>
    exec(`${nowBaseCommand} ${flags} alias set ${url} $DOMAIN`),
  getNonAliasedDeployments,
  getOldAliasedDeployments,
};
