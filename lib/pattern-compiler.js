'use strict';

var path = require('path'),
    gutil = require('gulp-util'),
    utils = require('../lib/utils'),
    twigger = require('pattern-library-utilities').twigCompiler,
    PLUGIN_NAME = 'pattern-importer';

/**
 * Returns an object with the string-name of the pattern file to compile and our desired template engine
 *
 * note: this can be expanded to select a compiling engine according to whatever templates are available
 * @param {Object} options
 * @param {Object} patternFiles
 * @param {Object} file
 * @param {Object} paths
 *
 * @return {Object} patternCompilerData - Info about the file being converted into the pattern's html template
 * @return {Object} patternCompilerData.data - The data for the template's variables
 * @return {String} patternCompilerData.dest - Relative url for the final HTML template
 * @return {String} patternCompilerData.src - Relative url for the template-to-be-converted
 * @return {String} patternCompilerData.templateEngine - The name of the templating engine this conversin will use.
 */
function determineCompiler (options, patternFiles, fileType, fileSrc, paths) {

  var patternCompilerData = {};

  /* grab the pattern's data */
  patternCompilerData.data = patternFiles.data;

  /* determine destination file name and path */
  patternCompilerData.dest = path.join(patternFiles.patternTemplatePath,paths.directory + '.html');

  /* check that a template for our desired templateEngine is available */
  if(fileType === options.templateEngine) {
    /* the pattern.yml file contained a reference to a template of the same type as our desired template engine */
    patternCompilerData.src = fileSrc;
    patternCompilerData.templateEngine = options.templateEngine;
  } else if (fileType === 'html') {
    /* we didn't find our desired template type, so we'll default to a plain html template (if it exists) */
    patternCompilerData.src = fileSrc;
    patternCompilerData.templateEngine = 'none';
  } else {
    /* probably want to throw an error? leaving it out for now */
    //throw new gutil.PluginError(PLUGIN_NAME, 'Source template not listed in '+ patternObject.name);
  }

  return patternCompilerData;
}

/**
 * Returns a string with the post-compilation html
 *
 * note: this can be expanded to select a compiling engine according to whatever templates are available
 * @param {Object} patternCompilerData - Info about the file being converted into the pattern's html template
 * @param {Object} patternCompilerData.data - The data for the template's variables
 * @param {String} patternCompilerData.dest - Relative url for the final HTML template
 * @param {String} patternCompilerData.src - Relative url for the template-to-be-converted
 * @param {String} patternCompilerData.templateEngine - The name of the templating engine this conversin will use.
 *
 * @return {String} raw html
 */
function compileTemplate (patternCompilerData,options) {

  if(!patternCompilerData.templateEngine){
    throw new gutil.PluginError(PLUGIN_NAME, 'Somehow a templateEngine is not listed in the patternCompilerData object. Probably your fault.');
  }

  patternCompilerData.data = patternCompilerData.data || {};

  if (patternCompilerData.templateEngine === 'twig') {
    var twigOptions = options.templateEngineOptions;
    twigOptions.path = patternCompilerData.src;
    return twigger(twigOptions,patternCompilerData.data);
  } else if (patternCompilerData.templateEngine === 'swig') {
    // here is where you would process swig files
  } else if (patternCompilerData.templateEngine === 'mustache') {
    // you should be seeing a pattern in how this works by now
  } else if (patternCompilerData.templateEngine === 'none') {
    // this means it's raw html so no compiling should happen
    return twigger(patternCompilerData.src,patternCompilerData.data);
  } else {
    // we don't have a compiler for this, do we warn...or just copy?
  }
}

module.exports = {
  determineCompiler: determineCompiler,
  compileTemplate: compileTemplate
}
