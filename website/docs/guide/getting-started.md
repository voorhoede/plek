# Getting started

## Continuous integration
Plek runs from a continuous integration (CI) service as a CLI in the form of a Node.js package. From there the commit context and files are used to deploy. Check out the supported CI services with configuration examples.

## Installation
### GitHub
First enable Plek to integrate with GitHub by installing the GitHub app from the [GitHub app page](https://github.com/apps/plek). Make sure to give access to the repository you intend to deploy.

### CLI
The Plek CLI is provided as an npm package. When the project uses Node.js and npm the recommended way to include Plek is by installing it as a development dependency with `npm install -D plek`. This way the version is pinned and the module can be cached by the CI service. Alternatively install Plek globally during the CI tasks to get a specific version range: `npm install --global plek@1` or skip installation and only use `npx` before each command.


### CI service
The way to run the Plek CLI for each commit is different for each service, following are supported CI services examples.

> Note that at the moment Node.js version 8 or higher is required.

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
  - npx plek now -- '--team yourteam' 'yourdomain.cc' 'project-name'
```

#### [Circle CI](https://circleci.com/)
```yaml
version: 2
jobs:
  build:
    working_directory: ~/repo

    docker:
      - image: circleci/node:8

    steps:
      - checkout
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "package.json" }}

      - run: npm install

      - run: npx plek now -- '--team yourteam' 'yourdomain.cc' 'project-name'

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
```
