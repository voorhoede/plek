'use strict';

const axios = require('axios');
const path = require('path');

const exec = require('./exec.js');

const nowBaseCommand = `${path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  'now'
)} --token=$NOW_TOKEN`;

const zeitAxios = axios.create({
  baseURL: 'https://api.zeit.co/v3',
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

const getTeam = ({ teams, teamSlug }) =>
  teams.find(team => team.slug === teamSlug) ||
  Promise.reject([
    `Could not find Zeit team named: '${teamSlug}'.`,
    'Make sure the environment variable NOW_TOKEN has access to given team.',
  ].join('\n'));

const maybeGetTeamId = teamSlug =>
  teamSlug
    ? zeitAxios('/teams')
        .then(({ data }) => data.teams)
        .then(teams => getTeam({ teams, teamSlug }))
        .then(team => team.id)
    : Promise.resolve('');

const cleanup = ({ app, teamSlug }) =>
  maybeGetTeamId(teamSlug).then(teamId =>
    Promise.all([
      zeitAxios(`/now/deployments`, { params: { app, teamId } }),
      zeitAxios('/now/aliases', { params: { teamId } }),
    ])
      .then(([deploymentsResponse, aliasesResponse]) => ({
        deployments: deploymentsResponse.data.deployments,
        aliases: aliasesResponse.data.aliases,
      }))
      .then(deploymentsData =>
        [
          ...getNonAliasedDeployments(deploymentsData),
          ...getOldAliasedDeployments(deploymentsData),
        ].map(({ uid }) =>
          zeitAxios.delete(`/now/deployments/${uid}`, { params: { teamId } })
        )
      )
  );

module.exports = {
  cleanup: id => () => cleanup(id),
  deploy: flags => () =>
    exec(`${nowBaseCommand} ${flags} deploy`).then(
      ({ stdout, stderr }) =>
        stderr && !stderr.includes('Success') ? Promise.reject(stderr) : stdout
    ),
  alias: (url, flags) => () =>
    exec(`${nowBaseCommand} alias set ${url} $DOMAIN`),
  getNonAliasedDeployments,
  getOldAliasedDeployments,
};
