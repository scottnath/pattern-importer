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

  var optionsDefaults = {
    dataSource: 'pattern',
    dataFileName: 'pattern.yml',
    patternImportDest: './app/_patterns',
    cssCompiler: 'sass', // sass, less, stylus, none
    templateEngine: 'twig'
  }

var patternImporter = function patternImporter (options) {

  if (!options) options = {};

  // determine data source
  if (!options.dataSource) options.dataSource = optionsDefaults.dataSource;
  if (typeof options.dataSource !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern dataSource name must be a string');
  }

  // determine pattern datafileName name
  if (!options.dataFileName) options.dataFileName = optionsDefaults.dataFileName;
  if (typeof options.dataFileName !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern dataFileName name must be a string');
  }

  // determine compiled pattern target location
  if (!options.patternImportDest) options.patternImportDest = optionsDefaults.patternImportDest;
  if (typeof options.patternImportDest !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern import destination folder must be a string');
  }

  // determine pattern template compiling engine
  if (!options.templateEngine) options.templateEngine = optionsDefaults.templateEngine;
  if (typeof options.templateEngine !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern template engine must be a string');
  }

  // determine css compiler
  if (!options.cssCompiler) options.cssCompiler = optionsDefaults.cssCompiler;
  if (typeof options.cssCompiler !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'CSS compiler name must be a string');
  }
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

    // get various paths
    var paths = utils.getFilePaths(file);

    // add this pattern to the list of compiled patterns
    compiledPatterns.push(paths.folder);

    // convert single pattern
    importSinglePattern(paths,options);


    this.push(file);
    cb();
  });

  return stream;

}

module.exports = patternImporter;
