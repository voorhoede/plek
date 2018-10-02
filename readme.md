# Plek
[![CircleCI](https://img.shields.io/circleci/project/github/voorhoede/plek/master.svg?style=flat-square)](https://circleci.com/gh/voorhoede/plek/)
[![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)](https://www.npmjs.com/package/plek)
[![David CLI](https://img.shields.io/david/voorhoede/plek.svg?path=packages/cli&style=flat-square&label=cli)](https://david-dm.org/voorhoede/plek?path=packages/cli)
[![David Server](https://img.shields.io/david/voorhoede/plek.svg?path=packages/server&style=flat-square&label=server)](https://david-dm.org/voorhoede/plek?path=packages/server)
[![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/g/voorhoede/plek.svg?style=flat-square)](https://lgtm.com/projects/g/voorhoede/plek/)

*Make continuous deployment delightful.*

Plek is a GitHub integration and command line tool run from a continuous integration service. Plek deploys changes automatically and provides configured services like [ZEIT Now](https://zeit.co/now) out of the box. Additionally Plek shows the deployment status for each commit and provides 'preview' deployments for pull requests.

----

## To start using Plek
The Plek CLI available as npm package is run from a continuous integration script. For example the command to deploy a static website with ZEIT Now is: `npx plek now myproject.now.sh --config '--public --static' --app 'myproject'`. Plek will run through cleanup, deployment and aliasing using the commit context. Depending on this context Plek either deploys to the main domain or deploys to a subdomain for pull requests.

**See the [documentation](https://plek.now.sh/) for more information.**

## To start developing Plek
To run this project Node.js version 8 or above is required. The CLI and server code for plek is inside the `packages` directory and the website including docs can be found in the `website` directory. To install dependencies for all packages and the website run `npm install` from the project root.
