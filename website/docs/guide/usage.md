# Usage
The Plek CLI comes with the three main subcommands `cleanup`, `deploy` and `alias` to allow for custom scripts. Each command representing a step in the deployment flow. Additionally there is a subcommand for each supported service that goes through these steps automatically.

To run the CLI it will need to be in your `$PATH`, meaning it can be located. Depending on your installation method the `plek` commands below might need to be prefixed with `npx` or `./node_modules/.bin/`.

## Services
### [ZEIT Now](https://zeit.co/now)
`plek now <domain> --config <config> --app <app>`

To use the CLI make sure the the `NOW_TOKEN` environment variable is set.

::: tip
Set the [Now deployment region](https://zeit.co/docs/features/scaling) to ensure the appropriate region is used, the location detection of the Now CLI does not always go well with the CI service.
:::

#### flags
Accepts the flags that are passed to the Now CLI.

#### domain
Accepts a base domain that is used for aliasing.

#### app
Accepts a project name for Zeit.

## Steps
```
cleanup <command>
deploy <command>
alias <command> <domain>
```
Each step accepts a command to be run, this could be anything including running a Bash script.
