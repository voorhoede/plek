'use strict';

const test = require('ava');

const now = require('../src/now.js');

const fixture = {
  deployments: [
    {
      uid: '1',
      created: '1518782823367',
    },
    {
      uid: '2',
      created: '1524126586099',
    },
  ],
  aliases: [
    {
      alias: 'plek-test.now.sh',
      deployment: { id: '1' },
    },
  ],
};

test('getNonAliasedDeployments', t => {
  t.deepEqual(now.getNonAliasedDeployments(fixture), [fixture.deployments[1]]);
});

test('getOldAliasedDeployments', t => {
  t.deepEqual(
    now.getOldAliasedDeployments({ ...fixture, domain: 'plek.now.sh' }),
    [fixture.deployments[0]]
  );

  t.deepEqual(
    now.getOldAliasedDeployments({ ...fixture, domain: 'plek-test.now.sh' }),
    []
  );
});
