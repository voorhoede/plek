'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const exec = require('./exec.js');
const fatalError = require('./fatal-error.js');

const isExecutable = path => {
  try {
    fs.accessSync(path, fs.constants.X_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const nowCli = module.paths
  .map(directory => path.join(directory, '.bin', 'now'))
  .filter(isExecutable)[0];

const nowBaseCommand = `${nowCli} --token $NOW_TOKEN`;

const zeitAxios = axios.create({
  baseURL: 'https://api.zeit.co/',
  headers: { Authorization: `Bearer ${process.env.NOW_TOKEN}` },
});

const millisecondsToDays = ms => ms / 1000 / 60 / 60 / 24;

const getProjectId = ({ name, teamId }) =>
  zeitAxios(`/v1/projects/${name}`, { params: { teamId }})
    .then(({ data: { id } }) => id)
    .catch(() => fatalError(`Could not fetch project ${name}.`));

const getNonAliasedDeployments = ({ deployments, aliases }) =>
  deployments.filter(
    deployment => !aliases.find(alias => alias.deployment.id === deployment.uid)
  );

const getOldAliasedDeployments = ({ deployments, aliases, domain }) =>
  deployments.filter(deployment =>
    aliases.find(
      alias => (
        alias.deployment.id === deployment.uid &&
        alias.alias !== domain &&
        millisecondsToDays(Date.now() - deployment.created) > 60
      )
    )
  );

const getTeam = ({ teams, teamSlug }) =>
  teams.find(team => team.slug === teamSlug) ||
  Promise.reject(
    [
      `Could not find Zeit team named: '${teamSlug}'.`,
      'Make sure the environment variable NOW_TOKEN has access to given team.',
    ].join('\n')
  );

const maybeGetTeamId = teamSlug =>
  teamSlug
    ? zeitAxios('/v1/teams')
        .then(({ data }) => data.teams)
        .then(teams => getTeam({ teams, teamSlug }))
        .then(team => team.id)
    : Promise.resolve('');

const cleanup = ({ app, teamSlug, domain }) =>
  maybeGetTeamId(teamSlug)
    .then(teamId =>
      getProjectId({ name: app, teamId })
        .then(projectId =>
          Promise.all([
            zeitAxios(`/v3/now/deployments`, { params: { app, teamId } }),
            zeitAxios('/v2/now/aliases', { params: { teamId, projectId } }),
          ])
        )
        .then(([deploymentsResponse, aliasesResponse]) => ({
          deployments: deploymentsResponse.data.deployments,
          aliases: aliasesResponse.data.aliases,
        }))
        .then(deploymentsData =>
          [
            ...getNonAliasedDeployments(deploymentsData),
            ...getOldAliasedDeployments({ ...deploymentsData, domain }),
          ]
            .map(({ uid }) =>
              zeitAxios.delete(`/v3/now/deployments/${uid}`, {
                params: { teamId },
              })
            )
        )
    )
    .catch(error => {
      if (error.response && error.response.data.error.code === 'forbidden')
        fatalError('The specified Now token is invalid.');
    });

const processOutput = ({ stdout, stderr }) =>
  stderr && stderr.includes('Error') ? Promise.reject(stderr) : stdout;

module.exports = {
  cleanup: args => () => cleanup(args),
  deploy: ({ nowFlags, teamFlag, app }) => () =>
    exec(`${nowBaseCommand} deploy ${teamFlag} --name ${app} ${nowFlags}`)
      .then(processOutput),
  alias: ({ url, teamFlag }) => () =>
    exec(`${nowBaseCommand} alias ${teamFlag} set ${url} $DOMAIN`)
      .then(processOutput)
      .then(() => { return `${url} now points to ${process.env.DOMAIN}` }),
  getNonAliasedDeployments,
  getOldAliasedDeployments,
};
