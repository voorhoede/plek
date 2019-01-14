# Usage
The Plek CLI comes with a subcommand for each supported service, which is what you probably want to use most of the time since it takes care of all steps.

To run the CLI, it will need to be in your `$PATH`, meaning it can be located. Depending on your installation method the `plek` commands below might need to be prefixed with `npx` or `./node_modules/.bin/`.

## Services
### [ZEIT Now](https://zeit.co/now)
`plek now [options] <domain>`

To use the CLI make sure the `NOW_TOKEN` environment variable is set.

::: tip
Set the [Now deployment region](https://zeit.co/docs/features/scaling) to ensure the appropriate region is used, the location detection of the Now CLI does not always go well with the CI service.
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
Besides the service commands, there are three subcommands: `cleanup`, `deploy` and `alias` for each step in the deployment flow. This allows for custom scripts when more flexibility is needed.
```
cleanup <command>
deploy <command>
alias <command> <domain>
```
Each step accepts a command that could be and do anything. The `alias` command expects `domain` to be a base domain, for example: `voorhoede.nl`. When run in a pull request CI environment it will append the pull request information, for example: `pr-4.voorhoede.nl`.
