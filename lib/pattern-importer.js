'use strict';
var through = require('through2'),
    utils = require('../lib/utils'),
    importSinglePattern = require('../lib/import-single-pattern'),
    getPatternImportData = require('../lib/get-pattern-import-data'),
    patternCompiler = require('../lib/pattern-compiler'),
    plUtils = require('pattern-library-utilities'),
    gutil = require('gulp-util'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer';

/*
 * Imports html patterns that are following the standards at github.com/pattern-library
 *
 * @param {Object} options
*/
module.exports = function patternImporter (options) {

  options = utils.getOptions(options);

  var stream = through.obj(function (file, encoding, cb) {

    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported'));
      return cb();
    }

    /* get path details for our pattern */
    var paths = plUtils.getFilePaths(file);

    var patternFiles = getPatternImportData(paths, options);

    /* send our pattern's files to be copied or written */
    utils.writeCopyFiles(patternFiles);

    this.push(file);
    cb();
  });

  return stream;

}
