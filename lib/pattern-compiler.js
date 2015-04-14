'use strict';

var path = require('path'),
    fsp = require('fs-promise'),
    mkdirp = require('mkdirp'),
    twigger = require('../twig-compile').compile,
    utils = require('../utils');

/**
 * Returns an object with the string-name of the pattern file to compile and our desired template engine
 * @function determineCompiler
 *
 * note: this can be expanded to select a compiling engine according to whatever templates are available
 *
 */
var determineCompiler = function determineCompiler (options, patternObject) {

  var patternCompilerData = {};

  // check that a template for our desired templateEngine is available
  if(patternObject[options.templateEngine]) {
    // the pattern.yml file contained a reference to a template of the same type as our desired template engine
    patternCompilerData.src = patternObject[options.templateEngine];
    patternCompilerData.templateEngine = options.templateEngine;
  } else if (patternObject.html) {
    // we didn't find our desired template type, so we'll default to a plain html template if it exists
    patternCompilerData.src = patternObject.html;
    patternCompilerData.templateEngine = 'none';
    // let's warn the user that this happened
    console.log('A '+ options.templateEngine +' template is not available for '+ patternObject.name +'. Substituting with the'+ patternObject.html +' file.');
  } else {
    // this pattern doesn't have either, so here's your error!
    throw new gutil.PluginError(PLUGIN_NAME, 'Source template not listed in '+ patternObject.name);
  }

  return patternCompilerData;
}

module.exports = {
  determineCompiler: determineCompiler
}




    // // check that a template for our desired templateEngine is available
    // if(patternObject[options.templateEngine]) {
    //   src = meta[options.templateEngine];
    // } else if (meta.html) {
    //   // defaults to an html template
    //   console.log('A '+ options.templateEngine +' template is not available for '+ meta.name +'. Substituting with the'+ meta.html +' file.');
    //   src = meta.html;
    // } else {
    //   throw new gutil.PluginError(PLUGIN_NAME, 'Source template not listed in '+ meta.name);
    // }
    // var destinationHtml = path.join(patternDestDir,patternDirName +'.html');
    // if (options.templateEngine === 'twig') {
    //   twigger(path.join(patternFolder,src),destinationHtml,meta.data);
    // } else if (options.templateEngine === 'swig') {
    //   // here is where you would process swig files
    // } else if (options.templateEngine === 'moustache') {
    //   // you should be seeing a pattern in how this works by now
    // } else {
    //   // if we get here, we're just gonna copy our html file as is
    //   fsp.writeFile(destinationHtml, path.join(patternFolder,src))
    //   .then(function(){
    //     console.log(path.basename(dest) + ' template rendered');
    //   });
    // }
