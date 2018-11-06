# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and follows [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2018-11-06
### Added
- [Fly](https://fly.io/) service integration for continuous edge computing delivery!
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

[3.0.0]: https://github.com/voorhoede/plek/compare/v3.0.0...v2.0.2
[2.0.2]: https://github.com/voorhoede/plek/compare/v2.0.2...v2.0.1
[2.0.1]: https://github.com/voorhoede/plek/compare/v2.0.1...v2.0.0
[2.0.0]: https://github.com/voorhoede/plek/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/voorhoede/plek/compare/v1.0.0...v1.0.1
