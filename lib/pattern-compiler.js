'use strict';

var path = require('path'),
    twigger = require('./pattern-compilers/twig-compiler'),
    utils = require('../lib/utils');

/**
 * Returns an object with the string-name of the pattern file to compile and our desired template engine
 * @function determineCompiler
 *
 * note: this can be expanded to select a compiling engine according to whatever templates are available
 * @param {Object} options
 * @param {Object} patternObject
 * @param {String} getPatternDestPath
 * @param {Object} paths
 *
 * @returns {Object} patternCompilerData - Info about the file being converted into the pattern's html template
 * @returns {Object} patternCompilerData.data - The data for the template's variables
 * @returns {String} patternCompilerData.dest - Relative url for the final HTML template
 * @returns {String} patternCompilerData.src - Relative url for the template-to-be-converted
 * @returns {String} patternCompilerData.templateEngine - The name of the templating engine this conversin will use.
 */
function determineCompiler (options, patternObject, patternDestPath, paths) {

  var patternCompilerData = {};

  // determine data
  patternCompilerData.data = patternObject.data;

  // determine destination
  patternCompilerData.dest = path.join(patternDestPath,paths.directory + '.html');

  // check that a template for our desired templateEngine is available
  if(patternObject[options.templateEngine]) {
    // the pattern.yml file contained a reference to a template of the same type as our desired template engine
    patternCompilerData.src = path.join(paths.folder,patternObject[options.templateEngine]);
    patternCompilerData.templateEngine = options.templateEngine;
  } else if (patternObject.html) {
    // we didn't find our desired template type, so we'll default to a plain html template if it exists
    patternCompilerData.src = path.join(paths.folder,patternObject.html);
    patternCompilerData.templateEngine = 'none';
    // let's warn the user that this happened
    console.log('A '+ options.templateEngine +' template is not available for '+ patternObject.name +'. Substituting with the'+ patternObject.html +' file.');
  } else {
    // this pattern doesn't have either, so here's your error!
    throw new gutil.PluginError(PLUGIN_NAME, 'Source template not listed in '+ patternObject.name);
  }

  return patternCompilerData;
}

/**
 * Returns a string with the post-compilation html
 * @function compileTemplate
 *
 * note: this can be expanded to select a compiling engine according to whatever templates are available
 * @param {Object} patternCompilerData - Info about the file being converted into the pattern's html template
 * @param {Object} patternCompilerData.data - The data for the template's variables
 * @param {String} patternCompilerData.dest - Relative url for the final HTML template
 * @param {String} patternCompilerData.src - Relative url for the template-to-be-converted
 * @param {String} patternCompilerData.templateEngine - The name of the templating engine this conversin will use.
 *
 * @returns {String} raw html
 */
function compileTemplate (patternCompilerData) {

  if(!patternCompilerData.templateEngine){
    throw new gutil.PluginError(PLUGIN_NAME, 'Somehow a templateEngine is not listed in the patternCompilerData object. Probably your fault.');
  }

  patternCompilerData.data = patternCompilerData.data || {};

  if (patternCompilerData.templateEngine === 'twig') {
    return twigger(patternCompilerData.src,patternCompilerData.data);
  } else if (patternCompilerData.templateEngine === 'swig') {
    // here is where you would process swig files
  } else if (patternCompilerData.templateEngine === 'moustache') {
    // you should be seeing a pattern in how this works by now
  } else if (patternCompilerData.templateEngine === 'none') {
    // this means it's raw html so no compiling should happen
    return twigger(patternCompilerData.src,patternCompilerData.dest);
  } else {
    // we don't have a compiler for this, do we warn...or just copy?
  }
}

module.exports = {
  determineCompiler: determineCompiler,
  compileTemplate: compileTemplate
}
