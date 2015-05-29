/**
 *  @fileOverview
 * Uses Gulpjs to import html patterns
 *
 *  @author       Scott Nath
 *
 *  @requires     NPM:gulp
 *  @requires     NPM:lodash.merge
 *  @requires     NPM:pattern-importer
 */
'use strict';

var gulp = require('gulp'),
  merge = require('lodash.merge'),
  patternImporter = require('../lib/pattern-importer'),
  patternImporterUtils = require('../lib/utils');

/**
 * Gulp task to import raw patterns and convert them to browser-ready html/css/js
 * @name patternsImport
 * @param {Object} options custom options
 * @param {Array|String} options.patternFiles  project-relative path to sets of un-compiled patterns
 * @param {Object}  options.patternImporterOptions  options needed for the pattern-importer
 * @requires NPM:Gulp
 * @requires NPM:lodash.merge
 */
module.exports = function (gulp, projectOptions) {

  /* default options for pattern-importer */
  var options = {
    patternFiles: ['./app/bower_components/pattern-library/patterns/**/pattern.yml','./app/patterns-local/**/pattern.yml'],
    patternImporterOptions: patternImporterUtils.getOptions()
  };

  /* merge project and default options */
  merge(options, projectOptions, function (a, b) {
    return Array.isArray(a) ? b : undefined;
  });

  /* the gulp task */
  gulp.task('patterns-import', function() {

    return gulp.src(options.patternFiles)
      .pipe(patternImporter(options));

  });

}
