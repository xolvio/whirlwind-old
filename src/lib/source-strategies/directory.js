const glob = require('glob');

module.exports = {
  parse(options) {
    return glob.sync(options.pattern, {cwd: options.directory});
  },
};
