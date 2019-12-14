# Plek
[![CircleCI Build Status][circleci-icon]][circleci]
[![LGTM Grade][lgtm-icon]][lgtm]
[![npm][npm-icon]][npm]

*Make continuous deployment delightful.*

Plek is a GitHub integration and command line tool run from a continuous integration service. Plek deploys changes automatically and provides configured services like [ZEIT Now](https://zeit.co/now) out of the box. Additionally Plek shows the deployment status for each commit and provides 'preview' deployments for pull requests.

----

## To start using Plek
The Plek CLI available as npm package is run from a continuous integration script. For example the command to deploy a static website with ZEIT Now is: `npx plek now myproject.now.sh --app myproject -- --public`. Plek will run through cleanup, deployment and aliasing using the commit context. Depending on this context Plek either deploys to the main domain or deploys to a subdomain for pull requests.

**See the [documentation](https://plek.now.sh/) for more information.**

## To start developing Plek
The CLI and server code for plek is inside the `packages` directory and the website including docs can be found in the `website` directory. To install dependencies for all packages and the website run `yarn install` from the project root.

[circleci]: https://circleci.com/gh/voorhoede/plek/
[circleci-icon]: https://img.shields.io/circleci/project/github/voorhoede/plek/master.svg?style=flat-square
[lgtm]: https://lgtm.com/projects/g/voorhoede/plek/
[lgtm-icon]: https://img.shields.io/lgtm/grade/javascript/g/voorhoede/plek.svg?style=flat-square
[npm]: https://www.npmjs.com/package/plek
[npm-icon]: https://img.shields.io/npm/v/plek.svg?style=flat-square
