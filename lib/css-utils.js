'use strict';

var path = require('path'),
    fs = require('fs');

var utils = require('./../utils'),
    sasser = require('./css-compilers/sass-compiler');

/**
 * Returns an object with the string-name of the style file to compile and our desired css-compiling engine
 * @function determineCssCompiler
 *
 */
var determineCssCompiler = function determineCssCompiler (options, patternObject) {

  var cssCompilerData = {};

  // check that a style file for our desired cssCompiler is available
  if(patternObject[options.cssCompiler]) {
    // the pattern.yml file contained a reference to a style file of the same type as our desired cssCompiler engine
    cssCompilerData.src = patternObject[options.cssCompiler];
    cssCompilerData.compilingEngine = options.cssCompiler;
  } else if (patternObject.css) {
    // we didn't find our desired cssCompiler type, so we'll default to a plain css file if it exists
    cssCompilerData.src = patternObject.css;
    cssCompilerData.compilingEngine = 'none';
    // let's warn the user that this happened
    console.log('A '+ options.cssCompiler +' template is not available for '+ patternObject.name +'. Substituting with the'+ patternObject.css +' file.');
  } else {
    // this pattern doesn't have either, so here's your error!
    throw new gutil.PluginError(PLUGIN_NAME, 'Source style file not listed in '+ patternObject.name);
  }

  return cssCompilerData;
}

/**
 * Sends out style file to the correct compiler
 * @function compileCss
 *
 */
var compileCss = function compileCss (paths, cssCompilerData) {

  if(!cssCompilerData.compilingEngine){
    throw new gutil.PluginError(PLUGIN_NAME, 'Somehow a compilingEngine is not listed in the cssCompilerData object. Probably your fault.');
  }

  var cssOutput;

  if (cssCompilerData.compilingEngine === 'sass') {
    cssOutput = sasser(paths, cssCompilerData);
  } else if (cssCompilerData.compilingEngine === 'less') {
    // here is where you would process less files
  } else if (cssCompilerData.compilingEngine === 'stylus') {
    // you should be seeing a pattern in how this works by now
  } else if (cssCompilerData.compilingEngine === 'none') {
    // this means it's raw css so just put the css into the variable
    cssOutput = fs.readFileSync(path.join(paths.folder, cssCompilerData.src),'utf8');
    // fsp.writeFile(destinationHtml, path.join(patternFolder,src))
    // .then(function(){
    //   console.log(path.basename(dest) + ' template rendered');
    // });
  } else {
    // we don't have a compiler for this, do we warn...or just copy?
  }

  return cssOutput;

}

/**
 * Creates the file name for our css file
 * @function cssFileName
 *
 */
var cssFileName = function cssFileName (name) {

  if(!name || name === ''){
    throw new gutil.PluginError(PLUGIN_NAME, 'There needs to be a name for your css file. Fail.');
  }
  return String(name) + '.css';

}

/**
 * Writes compiled css to a file
 * @function writeCss
 *
 */
var writeCss = function writeCss (dest, cssCompiledContents) {

  utils.writeFile(dest, cssCompiledContents);

}

module.exports = {
  determineCssCompiler: determineCssCompiler,
  compileCss: compileCss,
  cssFileName: cssFileName,
  writeCss: writeCss
}
