'use strict';

var path = require('path'),
    fs = require('fs-extra'),
    File = require('vinyl'),
    gutil = require('gulp-util'),
    transform = require('gulp-inject').transform;

/**
 * Returns an object containing pattern importer's options
 * @function getOptions
 *
 * @param {Object} options
 *
 * @returns {Object} options
 */
function getOptions (options) {

  var optionsDefaults = {
    dataSource: 'pattern',
    dataFileName: 'pattern.yml',
    patternImportDest: './app/PUBLIC',
    cssCompiler: 'sass', // sass, less, stylus, none
    templateEngine: 'twig',
    templateDonut: {
      'twig': './node_modules/pattern-importer/templates/donut.twig'
    },
    appFolder: 'app/'
  }
  var options = options || {};

  // determine data source
  options.dataSource = options.dataSource || optionsDefaults.dataSource;
  if (typeof options.dataSource !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern dataSource name must be a string');
  }

  // determine pattern datafileName name
  options.dataFileName = options.dataFileName || optionsDefaults.dataFileName;
  if (typeof options.dataFileName !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern dataFileName name must be a string');
  }

  // determine compiled pattern target location
  options.patternImportDest = options.patternImportDest || optionsDefaults.patternImportDest;
  if (typeof options.patternImportDest !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern import destination folder must be a string');
  }

  // determine pattern template compiling engine
  options.templateEngine = options.templateEngine || optionsDefaults.templateEngine;
  if (typeof options.templateEngine !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern template engine must be a string');
  }

  // determine css compiler
  options.cssCompiler = options.cssCompiler || optionsDefaults.cssCompiler;
  if (typeof options.cssCompiler !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'CSS compiler name must be a string');
  }

  // determine template engine
  options.templateEngine = options.templateEngine || optionsDefaults.templateEngine;
  if (typeof options.templateEngine !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Template Engine name must be a string');
  }

  // determine template donut
  options.templateDonut = options.templateDonut || optionsDefaults.templateDonut;
  if (typeof options.templateDonut !== 'object') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Template donut must be an object');
  }

  // check we have a donut for our template engine
  if (!options.templateDonut[options.templateEngine]) {
    throw new gutil.PluginError(PLUGIN_NAME, 'You do not have a '+String(options.templateEngine)+' template donut. Add one to the Pattern Importer options.');
  }

  return options;
}


/**
 * Returns a pattern's data from the desired source
 * @function getPatternData
 *
 */
function getPatternData (patternObject, dataSource) {

  if(dataSource == 'pattern'){
    return patternObject.data;
  } else {
    return patternObject.data;
  }

}

/**
 * Checks whether a pattern has already been compiled
 * @function checkPatternCompiled
 *
 */
function checkPatternCompiled (paths, compiledPatterns) {

  if(Array.isArray(compiledPatterns)){
    if(compiledPatterns[paths.folder]){
      return true;
    }
  }
  return false;
}

/**
 * Returns an object from yaml-data-created object
 * @function convertYamlToObject
 *
 */
function createCompiledYmlObject (patternObject, paths, options) {
  var compiledYml = {};

  // start putting pattern data into compiledYml object
  compiledYml.name = patternObject.name;

  // source will be the location of the pattern in this project
  compiledYml.source = paths.folder;

  // source of the DATA used - NATH: this section will change with addition of func to add LIVE/LOCAL data
  compiledYml.dataSource = options.dataSource;

  // if there is a description, we'll add that to the compiledYml object
  if (patternObject.description) {
    compiledYml.description = patternObject.description
  }

  // if there are includes, we'll add that to the compiledYml object
  if (patternObject.includes) {
    compiledYml.includes = patternObject.includes
  }

  compiledYml.categoryUrl = '';
  // if there is a category, we'll put this pattern into that category's subfolder
  if (patternObject.category) {

    // add category to compiledYml
    compiledYml.category = compiledYml.categoryUrl = patternObject.category

  } else {
    compiledYml.category = compiledYml.categoryUrl = 'uncategorized';
  }

  // if there is a category, we'll put this pattern into that category's subfolder
  if (patternObject.subcategory) {

    // add category to compiledYml
    compiledYml.subcategory = patternObject.subcategory
    compiledYml.categoryUrl = path.join(patternObject.category,patternObject.subcategory);

  }

  return compiledYml;
}

/**
 * Returns a relative path to a pattern's destination folder
 * @function getPatternDestPath
 *
 */
function getPatternDestPath (object, paths, options) {

  return path.join(options.patternImportDest, object.categoryUrl, paths.directory);

}

/**
 * Writes a variable of content to a file
 * @function writeFile
 *
 */
function writeFile (dest, contents) {

  fs.outputFile(dest, contents, function (err) {
    if (err) return console.error(err);

    console.log('File written: '+dest);
  })

};

/**
 * Copies a file from one place to another
 * @function copyFile
 *
 */
function copyFile (src, dest) {

  fs.copy(src, dest, function (err) {
    if (err) return console.error(err)
      console.log('File copied from: ' + src + ' to ' + dest);
  }) // copies file

};

/**
 * Returns an array of css files used by the pattern and its included patterns
 * @function getPatternCssFilesArray
 *
 */
function getPatternCssFilesArray (patternFiles) {
  var cssArray = [];
  if(patternFiles.includedFiles){
    if((patternFiles.includedFiles.css) && Array.isArray(patternFiles.includedFiles.css)){
      cssArray = cssArray.concat(patternFiles.includedFiles.css);
    }
  }
  if(patternFiles.patternCss){
    cssArray.push(patternFiles.patternCss);
  }
  return cssArray;
}

/**
 * Returns an array of js files used by the pattern and its included patterns
 * @function getPatternJsFilesArray
 *
 */
function getPatternJsFilesArray (patternFiles) {
  var jsArray = [];
  if(patternFiles.includedFiles){
    if((patternFiles.includedFiles.js) && Array.isArray(patternFiles.includedFiles.js)){
      patternFiles.includedFiles.js.forEach(function (file) {
        jsArray.push(file);
      });
    }
  }
  if(patternFiles.patternScrip){
    jsArray.push(patternFiles.patternScript);
  }
  return jsArray;
}

/**
 * Returns a string of ready-to-use html elements for an array of files
 * @function createHtmlElements
 *
 * @param {Array,String} files
 *
 * @returns {String} files string containing html elements with relative references to the files
 */
function createHtmlElements (files) {

  if(!files){
    // something went wrong
    throw new gutil.PluginError(PLUGIN_NAME, 'files is blank for  createHtmlElements.');
  }
  var filesHtml = '';
  if(Array.isArray(files)){
    files.forEach(function(file){
      filesHtml += transform(file) + '\n';
    });
  } else {
    if(files !== ''){
      filesHtml = transform(String(files)) + '\n';
    }
  }
  return filesHtml;

}

/**
 * Updates our compiledPatterns object with details about this pattern and its includes
 * @function addPatternToCompiledPatterns
 *
 */
function addPatternToCompiledPatterns (paths, patternFiles, compiledPatterns) {

  compiledPatterns[paths.folder] = patternFiles;
}



module.exports = {
  getOptions: getOptions,
  getPatternData: getPatternData,
  checkPatternCompiled: checkPatternCompiled,
  createCompiledYmlObject: createCompiledYmlObject,
  getPatternDestPath: getPatternDestPath,
  writeFile: writeFile,
  copyFile: copyFile,
  getPatternCssFilesArray: getPatternCssFilesArray,
  getPatternJsFilesArray: getPatternJsFilesArray,
  createHtmlElements: createHtmlElements,
  addPatternToCompiledPatterns: addPatternToCompiledPatterns
}
