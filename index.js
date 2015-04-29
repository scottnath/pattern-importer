'use strict';
var through = require('through2'),
    utils = require('./lib/utils'),
    importSinglePattern = require('./lib/import-single-pattern'),
    gutil = require('gulp-util'),
    mkdirp = require('mkdirp'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer';

/*
 * Imports html patterns following the standards at github.com/pattern-library
 * @module patternImporter
 *
 * @param {Object} options
*/
function patternImporter (options) {

  options = utils.getOptions(options);

  // make the pattern target destination folder
  mkdirp.sync(options.patternImportDest);

  // array to keep track of compiled patterns
  var compiledPatterns = [];

  var stream = through.obj(function (file, encoding, cb) {

    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported'));
      return cb();
    }

    // convert single pattern
    importSinglePattern.importPattern(file, options, compiledPatterns);

    this.push(file);
    cb();
  });

  return stream;

}

module.exports = exports = patternImporter;

/**
 * Export the utilities functions
 */
exports.utils = require('./lib/utils');
