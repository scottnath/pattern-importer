'use strict';

var path = require('path'),
  fs = require('fs-extra'),
  File = require('vinyl'),
  gutil = require('gulp-util'),
  plUtils = require('pattern-library-utilities'),
  transform = require('gulp-inject').transform,
  merge = require('lodash.merge'),
  PLUGIN_NAME = 'pattern-importer';

/**
 * Returns an object containing pattern importer's options
 *
 * @param {Object} options
 *
 * @return {Object} options
 */
function getOptions (options) {

  var optionsDefaults = {
    compilePatternsOnImport: false,
    dataSource: 'pattern',
    dataFileName: 'pattern.yml',
    htmlTemplateDest: './source/_patterns',
    stylesDest: './source/css/scss',
    scriptsDest: './source/js',
    cssCompiler: 'sass', // sass, less, stylus, none
    templateEngine: 'twig',
    templateEngineOptions: {},
    templateDonut: {
      'twig': './node_modules/pattern-importer/templates/donut.twig'
    },
    convertCategoryTitles: false, // default: false
    convertCategoryTitlesDataFile: './node_modules/pattern-importer/data/pattern-lab-categories.yml',
    uncategorizedDir: 'uncategorized'
  }

  /* merge project and default options */
  options = merge(optionsDefaults, options, function (a, b) {
    return Array.isArray(a) ? b : undefined;
  });

  // should we compile the patterns when importing them?
  options.compilePatternsOnImport = options.compilePatternsOnImport || optionsDefaults.compilePatternsOnImport;
  if (typeof options.compilePatternsOnImport !== 'boolean') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Choosing to compile patterns should be true of false.');
  }

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

  // determine html template destination
  options.htmlTemplateDest = options.htmlTemplateDest || optionsDefaults.htmlTemplateDest;
  if (typeof options.htmlTemplateDest !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'HTML Template destination folder must be a string');
  }

  // determine styling files destination
  options.stylesDest = options.stylesDest || optionsDefaults.stylesDest;
  if (typeof options.stylesDest !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Styling files destination folder must be a string');
  }

  // determine script files destination
  options.scriptsDest = options.scriptsDest || optionsDefaults.scriptsDest;
  if (typeof options.scriptsDest !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Script files destination folder must be a string');
  }

  // determine pattern template compiling engine
  options.templateEngine = options.templateEngine || optionsDefaults.templateEngine;
  if (typeof options.templateEngine !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern template engine must be a string');
  }

  // determine template donut
  options.templateEngineOptions = options.templateEngineOptions || optionsDefaults.templateEngineOptions;
  if (typeof options.templateEngineOptions !== 'object') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Template engine options must be an object');
  }

  // determine css compiler
  options.cssCompiler = options.cssCompiler || optionsDefaults.cssCompiler;
  if (typeof options.cssCompiler !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'CSS compiler name must be a string');
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

  // determine directory name for patterns without a category
  options.uncategorizedDir = options.uncategorizedDir || optionsDefaults.uncategorizedDir;
  if (typeof options.uncategorizedDir !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Pattern dataFileName name must be a string');
  }

  return options;
}


/**
 * Returns a pattern's data from the desired source
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
 * Determines the category directory structure from the pattern's data
 *
 * @param {Object} categoriesObject  an object with category names and their corresponding desired name
 * @param {String} category  category name
 *
 * @return {String} category  category name
 */
function categoryNameConverter (categoriesObject, category) {

  if (typeof categoriesObject === 'object') {
    return categoriesObject[category] || category;
  } else {
    return category;
  }

}

/**
 * Determines the category directory structure from the pattern's data
 *
 * @param {Object} patternObject  individual pattern's data (from /pattern-name/pattern.yml)
 * @param {Object} options  pattern-importer options
 *
 * @return {String} categoryPath  internal path url to category
 */
function getCategoryPath (patternObject, options) {

  var categoryPath = '',
    subcategoryPath = '',
    categoryObject = '';

  /* grab the conversion data object */
  if(options.convertCategoryTitles && options.convertCategoryTitlesDataFile){
    categoryObject = plUtils.convertYamlToObject( fs.readFileSync(options.convertCategoryTitlesDataFile, {encoding:'utf8'}) );
  }
  /* make sure we're dealing with an object */
  var patternObject = patternObject || {};

  /* Checking for category structure */
  if(patternObject.category){
    if(categoryObject){
      categoryPath = categoryNameConverter(categoryObject.categories, patternObject.category);
    } else {
      categoryPath = patternObject.category;
    }

    if(patternObject.subcategory){
      if(categoryObject){
        subcategoryPath = categoryNameConverter(categoryObject.subcategories[categoryPath], patternObject.subcategory);
      } else {
        subcategoryPath = patternObject.subcategory;
      }
    }

  /* no category specified, give up and use option: uncategorizedDir */
  } else {
    return options.uncategorizedDir;
  }

  if(subcategoryPath){
    return path.join(categoryPath, subcategoryPath);
  }else{
    return path.join(categoryPath);
  }
}

/**
 * Returns an object from yaml-data-created object
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
 *
 */
function getPatternDestPath (object, paths, options) {

  return path.join(options.htmlTemplateDest, object.categoryUrl, paths.directory);

}

/*
 * Gets name of pattern template file. Defaults to .html file (if it exists)
 *
 * @param {Object} patternObject  metadata from pattern data file (default: pattern.yml)
 * @param {Object} options  pattern-importer options
 *
 * @returns {String} name of template file or false
*/
function getPatternTemplateName (patternObject, options) {

  if(patternObject[options.templateEngine]) {
    return patternObject[options.templateEngine];
  } else if(patternObject.html) {
    return patternObject.html;
  } else {
    return false;
  }
}

/*
 * Gets name of pattern style file. Defaults to .css file (if it exists)
 *
 * @param {Object} patternObject  metadata from pattern data file (default: pattern.yml)
 * @param {Object} options  pattern-importer options
 *
 * @returns {String} name of style file or false
*/
function getPatternStyleName (patternObject, options) {

  if(patternObject[options.cssCompiler]) {
    return patternObject[options.cssCompiler];
  } else if(patternObject.css) {
    return patternObject.css;
  } else {
    return false;
  }
}

/**
 * Writes a variable of content to a file
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
 *
 */
function copyFile (src, dest) {

  fs.copy(src, dest, function (err) {
    if (err) return console.error(err)
      console.log('File copied from: ' + src + ' to ' + dest);
  }) // copies file

};

/**
 * Writes or copies files to their destination directories
 *
 * @param {Object} patternFiles
 * @param {Array} patternFiles.filesToWrite   array of file objects
 * @param {Array} patternFiles.filesToCopy   array of file objects
 */
function writeCopyFiles (patternFiles) {

  /* write included files (like css/js) we had to compile */
  if((patternFiles.filesToWrite) && Array.isArray(patternFiles.filesToWrite)){
    patternFiles.filesToWrite.forEach(function(file){
      writeFile(file.dest, file.contents);
    });
  }

  /* copy over included files which didn't require compilation */
  if((patternFiles.filesToCopy) && Array.isArray(patternFiles.filesToCopy)){
    patternFiles.filesToCopy.forEach(function(file){
      copyFile(file.src, file.dest);
    });
  }

}
/**
 * Returns an array of css files used by the pattern and its included patterns
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
 *
 * @param {Array|String} files
 *
 * @return {String} files string containing html elements with relative references to the files
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
 *
 */
function addPatternToCompiledPatterns (paths, patternFiles, compiledPatterns) {

  compiledPatterns[paths.folder] = patternFiles;
}

/**
 * Development function to show console log info on an item
 *
 * @param {String} itemName  name of item to be logged
 * @param {String|Array|Object} item  item to be logged
 */
function clog(itemName,item){
  console.log(itemName);
  console.log(JSON.stringify(item, null, 2));
}


module.exports = {
  getOptions: getOptions,
  getPatternData: getPatternData,
  checkPatternCompiled: checkPatternCompiled,
  getCategoryPath: getCategoryPath,
  createCompiledYmlObject: createCompiledYmlObject,
  getPatternDestPath: getPatternDestPath,
  getPatternTemplateName: getPatternTemplateName,
  getPatternStyleName: getPatternStyleName,
  writeFile: writeFile,
  copyFile: copyFile,
  writeCopyFiles: writeCopyFiles,
  getPatternCssFilesArray: getPatternCssFilesArray,
  getPatternJsFilesArray: getPatternJsFilesArray,
  createHtmlElements: createHtmlElements,
  addPatternToCompiledPatterns: addPatternToCompiledPatterns,
  clog: clog
}
