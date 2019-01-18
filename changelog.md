# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and follows [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [3.2.1] - 2019-01-18
### Fixed
- False positive errors when using generic commands like `plek deploy` by only logging stderr output.

## [3.2.0] - 2019-01-04
### Added
- Support for the Now Platform 2.0, see the [upgrade guide](https://zeit.co/docs/v2/platform/upgrade-to-2-0) for more information.
- Progress logging so it is easier to keep an eye on the progress and view the final outcome.

### Changed
- Fatal errors from commands including the `now` subcommand cause the process to exit with a non-zero code.

## [3.1.0] - 2018-11-07
### Fixed
- Command parsing for the custom step subcommands: ` cleanup`, `deploy` and `alias`, thanks to [@thadeetrompetter](https://github.com/thadeetrompetter)!

### Added
- [Codefresh](https://codefresh.io/) CI support.

## [3.0.0] - 2018-11-06
### Added
- [Fly](https://fly.io/) service integration for continuous edge computing delivery, thanks to [@mrkurt](https://github.com/mrkurt) and [@michaeldwan](https://github.com/michaeldwan)!
- Sentry error reporting for fatal errors.

### Changed
- Use `yargs` for more strict and robust CLI input handling, this can break edge cases where input is partly missing but still passes.
- The `now` subcommand `config` flag has been replaced with passing flags after the `--` separator.

### Fixed
- Removal of old ZEIT Now deployment aliased with the base domain.

## [2.0.2] - 2018-08-01
### Changed
- Use Zeit Now token as environment variable without interpreting for added security.

## [2.0.1] - 2018-07-12
### Fixed
- Passing no team to the Now subcommand.

## [2.0.0] - 2018-07-12
### Added
- Context of the current directory to support monorepos!

### Changed
- Use provided Zeit Now app name argument as deployment name.
- Pass Zeit team name as `team` flag instead of putting it inside the `config` flag value.
- Be able to show help information when using `plek --help` outside CI environments, very handy...

### Fixed
- Updating the GitHub commit status during cleanup and deployment.

## [1.0.1] - 2018-06-12
### Fixed
- Now subcommand options parsing, passing the Zeit team to the CLI works.

## 1.0.0 - 2018-06-08
### Added
- Initial release!

[3.2.1]: https://github.com/voorhoede/plek/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/voorhoede/plek/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/voorhoede/plek/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/voorhoede/plek/compare/v2.0.2...v3.0.0
[2.0.2]: https://github.com/voorhoede/plek/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/voorhoede/plek/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/voorhoede/plek/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/voorhoede/plek/compare/v1.0.0...v1.0.1
