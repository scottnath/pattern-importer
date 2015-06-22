'use strict';

var path = require('path'),
    fs = require('fs');

var mkdirp = require('mkdirp'),
    through = require('through2'),
    File = require('vinyl'),
    plUtils = require('pattern-library-utilities');

var patternCompiler = require('./pattern-compiler.js'),
    cssUtils = require('./css-utils.js'),
    utils = require('../lib/utils');


/*
 * Gets details on an html pattern (and its supporting files) coming from a Pattern Library-structured directory
 *
 * @param {Array} paths  path info on pattern
 * @param {Object} options  pattern-importer options
*/
function getPatternImportData (paths, options) {

  /* open the individual pattern's data file */
  var patternYml = fs.readFileSync(path.join(paths.folder, options.dataFileName), {encoding:'utf8'});

  /* create an object to store data about this pattern's files */
  var patternFiles = {};
  patternFiles.filesToWrite = [];
  patternFiles.filesToCopy = [];

  /* get metadata from pattern.yml file */
  var patternObject = plUtils.convertYamlToObject(patternYml);

  /* get the pattern's category directory */
  var patternCategoryPath = utils.getCategoryPath(patternObject, options);

  /* determine the pattern's template destination directory */
  var patternTemplatePath = path.join(options.htmlTemplateDest,patternCategoryPath);

  /* determin the pattern's styles destination directory */
  var patternStylesPath = path.join(options.stylesDest,patternCategoryPath);

  /* determin the pattern's styles destination directory */
  var patternScriptsPath = path.join(options.scriptsDest,'pattern-scripts',patternCategoryPath);

  /* use defined template type or default to html */
  var patternTemplate = getPatternTemplateName(patternObject, options);

  if(patternTemplate){

    /* add pattern template to files-to-copy array */
    var patternFileToCopy = {
      type: 'pattern',
      src: path.join(paths.folder,patternTemplate),
      dest: path.join(patternTemplatePath,patternTemplate)
    }
    patternFiles.filesToCopy.push(patternFileToCopy);

    /* add data file to files-to-write array */
    var patternDataFile = paths.directory + '.json';
    var patternFileToWrite = {
      type: 'data',
      dest: path.join(patternTemplatePath,patternDataFile),
      contents: patternObject.data
    }
    patternFiles.filesToWrite.push(patternFileToWrite);

    /* determine style file */
    var patternStyle = getPatternStyleName(patternObject, options);
    /* add pattern style file to files-to-copy array */
    if(patternStyle){
      var patternFileToCopy = {
        type: 'styles',
        src: path.join(paths.folder,patternStyle),
        dest: path.join(patternStylesPath,patternStyle)
      }
      patternFiles.filesToCopy.push(patternFileToCopy);
    }

    /* add javascript file(s) */
    if(patternObject.script){

      /* get the relative path to the js file source */
      var jsFileSourcePath = path.join(paths.folder,patternObject.script);

      /* get the relative path to the js file destination */
      var jsFileDestinationPath = path.join(patternScriptsPath,patternObject.script);

      /* add an object about this file to the filesToWrite array */
      var jsFileToCopy = {
        type: 'js',
        src: jsFileSourcePath,
        dest: jsFileDestinationPath
      }
      patternFiles.filesToCopy.push(jsFileToCopy);

    }

  }
  return patternFiles;
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

module.exports = {
  getPatternImportData: getPatternImportData
};
