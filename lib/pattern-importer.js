'use strict';
var through = require('through2'),
    utils = require('../lib/utils'),
    importSinglePattern = require('../lib/import-single-pattern'),
    importUncompiledPatterns = require('../lib/import-uncompiled-patterns'),
    plUtils = require('pattern-library-utilities'),
    gutil = require('gulp-util'),
    mkdirp = require('mkdirp'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer';

/*
 * Imports html patterns that are following the standards at github.com/pattern-library
 *
 * @param {Object} options
*/
module.exports = function patternImporter (options) {

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

    if(options.compilePatternsOnImport){
      // original pattern-compilation importing
      importSinglePattern.importPattern(file, options, compiledPatterns);
    } else {
      // uncompiled importing for systems like Pattern Lab
      var paths = plUtils.getFilePaths(file);
      var patternFiles = importUncompiledPatterns.getPatternImportData(paths, options);

      utils.writeCopyFiles(patternFiles);
    }

    this.push(file);
    cb();
  });

  return stream;

}
