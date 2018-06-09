test# Plek
*Make continuous deployment delightful.*

Plek is a GitHub integration and command line tool run from a continuous integration service. Plek deploys changes automatically and provides configured services like [ZEIT Now](https://zeit.co/now) out of the box. Additionally Plek shows the deployment status for each commit and provides 'preview' deployments for pull requests.

----

> Note that this project is in early stage of development with things shifting around and lacking documentation around some aspects.

## To start using Plek
The Plek CLI available as npm package is run from a continuous integration script. For example the command to deploy a static website with ZEIT Now is: `npx plek now myproject.now.sh --config '--public --static' --app 'myproject'`. Plek will run through cleanup, deployment and aliasing using the commit context. Depending on this context Plek either deploys to the main domain or deploys to a subdomain for pull requests.

**See the [documentation](https://plek.now.sh/) for more information.**

## To start developing Plek
To run this project Node.js version 8 or above is required. Most code is inside the `packages` directory containing the CLI and server packages. To kick off each package run `npm install` and `npm start` from inside their directory.
