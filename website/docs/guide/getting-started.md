# Getting started

## Continuous integration
Plek runs from a continuous integration (CI) service as a command line tool (CLI). Plek uses the environment variables and files available in the CI.

## Installation
### GitHub
To integrate Plek with GitHub install the [Plek GitHub app](https://github.com/apps/plek).

### CLI
`npx plek` will run the Plek CLI as it is a npm package. When your project uses Node.js the recommended way to include Plek is by installing it as a development dependency with `npm install -D plek`. This way the version is pinned and the module can be cached by the CI service. Alternatively use the latest version and skip installation by only using `npx plek`.

### CI service
::: tip NOTE
Node.js version 8 or higher is required to run the CLI.
:::
Where and when to run Plek is up to you. Following are two minimal examples showing how to run Plek for each commit using the ZEIT Now service.

#### [Travis CI](https://travis-ci.com/)
```yaml
language: node_js

node_js:
  - 8

cache:
  directories:
    - $HOME/.npm

script:
  - npm install
  - npx plek now yourdomain.cc --app 'project-name'
```

#### [Circle CI](https://circleci.com/)
```yaml
version: 2
jobs:
  build:
    working_directory: ~/project-name

    docker:
      - image: circleci/node:8

    steps:
      - checkout
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "package.json" }}

      - run: npm install

      - run: npx plek now yourdomain.cc --app 'project-name'

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
```
