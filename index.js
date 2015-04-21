'use strict';

/*

THIS IS BETA CODE

code below works, but is a POC and not finalized or optimized in any way

*/

var through = require('through2'),
    utils = require('./utils'),
    importSinglePattern = require('./lib/import-single-pattern'),
    patternCompiler = require('./lib/pattern-compiler'),
    gutil = require('gulp-util'),
    twig = require('twig'),
    yaml = require('js-yaml'),
    path = require('path'),
    fs = require('fs-extra'),
    mkdirp = require('mkdirp'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer',
    patternList = [];

    var sass = require('node-sass');


var patternImporter = function patternImporter (options) {

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
    importSinglePattern.importSinglePattern(file, options, compiledPatterns);

    //compiledPatterns.push(patternFiles);
    console.log('compiledPatterns');
    console.log(compiledPatterns);


    this.push(file);
    cb();
  });

  return stream;

}

module.exports = patternImporter;
