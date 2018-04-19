'use strict';

module.exports = std =>
  std.stderr ? Promise.reject(std.stderr) : Promise.resolve(std.stdout);
