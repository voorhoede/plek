'use strict';

const test = require('ava');

const fly = require('../src/fly.js');

const fixture = [
  {
    id: 'pr-7-plek-test',
    type: 'apps',
    attributes: {
      name: 'pr-7-plek-test',
      hostname: 'pr-7-plek-test.edgeapp.net',
    },
  },
  {
    id: 'prague',
    type: 'apps',
    attributes: {
      name: 'plek-test',
      hostname: 'plek-test.edgeapp.net',
    },
  },
];

test('get pull request apps', t => {
  t.deepEqual(fly.getPrApps(fixture), [
    {
      id: 'pr-7-plek-test',
      type: 'apps',
      attributes: {
        name: 'pr-7-plek-test',
        hostname: 'pr-7-plek-test.edgeapp.net',
      },
    },
  ]);
});
