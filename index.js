'use strict';

/**
 * Export `pattern-importer` and other functions
 */

module.exports = {
  patternImporter: require('./lib/pattern-importer'),
  utils: require('./lib/utils'),
  importSinglePattern: require('./lib/import-single-pattern'),
  gulpImportPatterns: require('./gulp/patterns-import')
}
