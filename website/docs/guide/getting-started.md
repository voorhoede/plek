# Getting started

## Continuous integration
Plek runs from a continuous integration (CI) service as a command line tool (CLI). Plek uses the environment variables and files available in the CI to deploy and integrate.

## Installation
### 1. GitHub
To integrate Plek with GitHub, install the [Plek GitHub app](https://github.com/apps/plek) on your GitHub account or organization and give it the needed repository access.

### 2. CLI
`npx plek` will run the Plek CLI as it is a npm package. When your project uses Node.js the recommended way to include Plek is by installing it as a development dependency with `npm install -D plek`. This way the version is pinned and the module can be cached by the CI service. Alternatively use the latest version and skip installation by only using `npx plek`.

::: tip NOTE
Node.js version 8 or higher is required to run the CLI.
:::

### 3. CI service
Where and when to run Plek is up to you but most of the time it will be from a CI script. Following are two minimal examples showing how to run Plek for each commit using the ZEIT Now service. The command using `npx plek` is where the magic happens, the rest is boilerplate.

#### [Travis CI](https://travis-ci.com/)
*.travis.yml*
```yaml
language: node_js

node_js:
  - 8

cache:
  directories:
    - $HOME/.npm

branches:
  only:
    - master

script:
  - npm install
  - npx plek now yourdomain.cc --app 'project-name' -- --public
```

#### [Circle CI](https://circleci.com/)
*.circleci/config.yml*
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

      - run: npx plek now yourdomain.cc --app 'project-name' -- --public

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
```

Because these examples use the ZEIT Now service, a [ZEIT token](https://zeit.co/account/tokens) is expected to be in the `NOW_TOKEN` environment variable of the CI. To set an environment variable see the [Travis CI](https://docs.travis-ci.com/user/environment-variables/#defining-variables-in-repository-settings) or [Circle CI](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) documentation.

:rocket: Done! Your project will now be automatically deployed for every commit.
