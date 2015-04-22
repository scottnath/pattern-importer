'use strict';

var path = require('path'),
    fs = require('fs-extra'),
    yaml = require('js-yaml'),
    File = require('vinyl'),
    transform = require('gulp-inject').transform;

/**
 * Returns an object containing pattern importer's options
 * @function getOptions
 *
 * @param {Object} options
 *
 * @returns {Object} options
 */
var getOptions = function getOptions (options) {

  var optionsDefaults = {
    dataSource: 'pattern',
    dataFileName: 'pattern.yml',
    patternImportDest: './app/_patterns',
    cssCompiler: 'sass', // sass, less, stylus, none
    templateEngine: 'twig',
    templateDonut: {
      'twig': './node_modules/pattern-importer/templates/donut.twig'
    },
    appFolder: 'app/'
  }

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

  // determine template engine
  if (!options.templateEngine) options.templateEngine = optionsDefaults.templateEngine;
  if (typeof options.templateEngine !== 'string') {
    throw new gutil.PluginError(PLUGIN_NAME, 'Template Engine name must be a string');
  }

  // determine template donut
  if (!options.templateDonut) options.templateDonut = optionsDefaults.templateDonut;
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
 * Returns an object of file path data
 * @function getFilePaths
 *
 */
var getFilePaths = function getFilePaths (file) {

  var paths = {
    absolute: file.path,
    relative: file.path.replace(process.cwd() + '/', ''),
    folder: file.path.replace(process.cwd() + '/', '').split('/').slice(0, -1).join('/'),
    directory: path.basename(file.path.replace(process.cwd() + '/', '').split('/').slice(0, -1).join('/'))
  };
  return paths;
}

/**
 * Returns an object from yaml data
 * @function convertYamlToObject
 *
 */
var convertYamlToObject = function convertYamlToObject (yml) {
  return yaml.safeLoad(yml);
}

/**
 * Returns yaml data from an object
 * @function convertObjectToYaml
 *
 */
var convertObjectToYaml = function convertYamlToObject (object) {
  return yaml.safeDump(object);
}

/**
 * Returns a pattern's data from the desired source
 * @function getPatternData
 *
 */
var getPatternData = function getPatternData (patternObject, dataSource) {

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
var checkPatternCompiled = function checkPatternCompiled (paths, compiledPatterns) {

  if(Array.isArray(compiledPatterns)){
    if(compiledPatterns[paths.folder] !== undefined){
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
var createCompiledYmlObject = function createCompiledYmlObject (patternObject, paths, options) {
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
var getPatternDestPath = function getPatternDestPath (object, paths, options) {

  return path.join(options.patternImportDest, object.categoryUrl, paths.directory);

}

/**
 * Creates a vinyl file
 * @function createFile
 *
 */
var createFile = function createFile (filePath, cwd, base, type) {
  var contents;
  //var filePath = path.join(__filename, '..', 'fixtures', filePath);

  if (type == 'stream') {
    contents = fs.createReadStream(filePath);
  } else {
    contents = fs.readFileSync(filePath);
  }

  return new File({
    path: filePath,
    cwd: cwd,
    base: base,
    contents: contents
  });
};

/**
 * Writes a variable of content to a file
 * @function writeFile
 *
 */
var writeFile = function writeFile (dest, contents) {

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
var copyFile = function copyFile (src, dest) {

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
var getPatternCssFilesArray = function getPatternCssFilesArray (patternFiles) {
  var cssArray = [];
  if(patternFiles.includedFiles !== undefined){
    if((patternFiles.includedFiles.css !== undefined) && Array.isArray(patternFiles.includedFiles.css)){
      patternFiles.includedFiles.css.forEach(function (file) {
        cssArray.push(file);
      });
    }
  }
  if(patternFiles.patternCss !== undefined){
    cssArray.push(patternFiles.patternCss);
  }
  return cssArray;
}

/**
 * Returns an array of js files used by the pattern and its included patterns
 * @function getPatternJsFilesArray
 *
 */
var getPatternJsFilesArray = function getPatternJsFilesArray (patternFiles) {
  var jsArray = [];
  if(patternFiles.includedFiles !== undefined){
    if((patternFiles.includedFiles.js !== undefined) && Array.isArray(patternFiles.includedFiles.js)){
      patternFiles.includedFiles.js.forEach(function (file) {
        jsArray.push(file);
      });
    }
  }
  if(patternFiles.patternScript !== undefined){
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
var createHtmlElements = function createHtmlElements (files) {

  if(files === undefined){
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
var addPatternToCompiledPatterns = function addPatternToCompiledPatterns (paths, patternFiles, compiledPatterns) {

  compiledPatterns[paths.folder] = patternFiles;
}



module.exports = {
  getOptions: getOptions,
	getFilePaths: getFilePaths,
  convertYamlToObject: convertYamlToObject,
  convertObjectToYaml: convertObjectToYaml,
  getPatternData: getPatternData,
  checkPatternCompiled: checkPatternCompiled,
  createCompiledYmlObject: createCompiledYmlObject,
  getPatternDestPath: getPatternDestPath,
  writeFile: writeFile,
  copyFile: copyFile,
  createFile: createFile,
  getPatternCssFilesArray: getPatternCssFilesArray,
  getPatternJsFilesArray: getPatternJsFilesArray,
  createHtmlElements: createHtmlElements,
  addPatternToCompiledPatterns: addPatternToCompiledPatterns
}
