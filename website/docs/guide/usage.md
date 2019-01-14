# Usage
The Plek CLI comes with a subcommand for each supported service, which is what you probably want to use most of the time since it takes care of all steps.

To run the CLI, make sure it is located in your `$PATH`. Depending on your installation method the `plek` commands might need to be prefixed with `npx` or `./node_modules/.bin/`.

## Services
### [ZEIT Now](https://zeit.co/now)
`plek now [options] <domain>`

To use the CLI make sure the `NOW_TOKEN` environment variable is set.

::: tip
Set the [deployment region](https://zeit.co/docs/v2/deployments/configuration/#regions) to ensure the closest region to you is used, the default location detection does not always work as expected from a CI service.
:::

#### options
- `app`: Zeit Now app name.
- `config`: Zeit Now CLI configuration flags.
- `team`: Zeit team name.

#### domain
Accepts a base domain that is used for aliasing.

### [Fly](https://fly.io/)
`fly [options] <appName>`

To use the CLI make sure the `FLY_TOKEN` environment variable is set.

#### options
- `stage`: Environment stage to use.

#### appName
The Fly app name as returned by the `fly apps` command.

## Custom steps
Besides the service commands, there are three subcommands: `cleanup`, `deploy` and `alias`, each represents a step in the deployment flow. These commands allow for custom scripts when more flexibility is needed.

```
cleanup <command>
deploy <command>
alias <command> <domain>
```

Each step accepts a command that could be and do anything. The `alias` command expects `domain` to be a base domain, for example: `voorhoede.nl`. When run in a pull request CI environment it will append the pull request information, for example: `pr-4.voorhoede.nl`.
