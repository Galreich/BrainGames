const path = require('path');

module.exports = (request, options) => {
  // dictionary-he and word-list have restrictive "exports" fields that block
  // subpath access to package.json. Resolve them directly on the filesystem.
  if (request === 'dictionary-he/package.json') {
    return path.resolve(options.rootDir || __dirname, 'node_modules', 'dictionary-he', 'package.json');
  }
  if (request === 'word-list/package.json') {
    return path.resolve(options.rootDir || __dirname, 'node_modules', 'word-list', 'package.json');
  }
  return options.defaultResolver(request, options);
};
