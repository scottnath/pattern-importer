'use strict';

var path = require('path'),
    fs = require('fs');

var mkdirp = require('mkdirp'),
    through = require('through2'),
    File = require('vinyl'),
    plUtils = require('pattern-library-utilities');

var patternCompiler = require('./pattern-compiler.js'),
    cssUtils = require('./css-utils.js'),
    utils = require('../lib/utils'),
    convertTwigIncludesPaths = require('../lib/convert-twig-includes-paths.js');


/*
 * Gets details on an html pattern (and its supporting files) coming from a Pattern Library-structured directory
 *
 * @param {Array} paths  path info on pattern
 * @param {Object} options  pattern-importer options
*/
module.exports = function getPatternImportData (paths, options) {

  // open the individual pattern's data file
  var patternYml = fs.readFileSync(path.join(paths.folder, options.dataFileName), {encoding:'utf8'});

  // create an object to store data about this pattern's files
  var patternFiles = {};
  patternFiles.data = {};
  patternFiles.filesToWrite = [];
  patternFiles.filesToCopy = [];

  // get metadata from pattern.yml file
  var patternObject = plUtils.convertYamlToObject(patternYml);

  // get the pattern's category directory
  patternFiles.patternCategoryPath = utils.getCategoryPath(patternObject, options);

  // determine the pattern's template destination directory
  patternFiles.patternTemplatePath = path.join(options.htmlTemplateDest,patternFiles.patternCategoryPath);

  // determin the pattern's styles destination directory
  patternFiles.patternStylesPath = path.join(options.stylesDest,patternFiles.patternCategoryPath);

  // determin the pattern's styles destination directory
  patternFiles.patternScriptsPath = path.join(options.scriptsDest,patternFiles.patternCategoryPath);

  // use defined template type or default to html
  var patternTemplate = utils.getPatternTemplateName(patternObject, options);

  var fileType = path.extname(patternTemplate).replace('.','');

  var fileSrc = path.join(paths.folder,patternTemplate);

  if(patternTemplate){

    // compile templates to HTML on import
    if(options.compilePatternsOnImport){
      var patternCompilerData = patternCompiler.determineCompiler(options, patternFiles, fileType, fileSrc, paths);
      if(patternCompilerData.templateEngine !== 'none'){

        // add pattern data for compiling
        patternCompilerData.data = patternObject.data;
        // Use templating engine to get the final html content
        var patternHtmlContent = patternCompiler.compileTemplate(patternCompilerData,options);

        // add file to our filesToWrite array
        patternFiles.filesToWrite.push({
          'type': 'pattern',
          'dest': path.join(patternFiles.patternTemplatePath,paths.directory+'.html'),
          'contents': patternHtmlContent
        });
      } else {
        // add pattern template to files-to-copy array
        var patternFileToCopy = {
          type: 'pattern',
          src: path.join(paths.folder,patternTemplate),
          dest: path.join(patternFiles.patternTemplatePath,patternTemplate)
        }
        patternFiles.filesToCopy.push(patternFileToCopy);
      }
    } else {

      // convert twig includes IF we are switching category directory titles in our destination directory
      if(options.convertCategoryTitles && options.convertCategoryTitlesData && (options.templateEngine === 'twig')){
        
        var twigContent = convertTwigIncludesPaths.convertTwigIncludes(options,fs.readFileSync(path.join(paths.folder,patternTemplate), {encoding:'utf8'}))

        // add file to our filesToWrite array
        patternFiles.filesToWrite.push({
          'type': 'pattern',
          'dest': path.join(patternFiles.patternTemplatePath,paths.directory+'.twig'),
          'contents': twigContent
        });
        
      } else {
        // no conversion, add pattern template to files-to-copy array
        var patternFileToCopy = {
          type: 'pattern',
          src: path.join(paths.folder,patternTemplate),
          dest: path.join(patternFiles.patternTemplatePath,patternTemplate)
        }
        patternFiles.filesToCopy.push(patternFileToCopy);
      }
    }

    // add data file to files-to-write array
    if(patternObject.data){
      var patternDataFile = paths.directory + '.json';
      var patternFileToWrite = {
        type: 'data',
        dest: path.join(patternFiles.patternTemplatePath,patternDataFile),
        contents: patternObject.data
      }
      patternFiles.filesToWrite.push(patternFileToWrite);
      // add the data to main patternFiles object for easy reference later
      patternFiles.data = patternObject.data;
    }

    // determine style file
    var patternStyle = utils.getPatternStyleName(patternObject, options);
    // add pattern style file to files-to-copy array
    if(patternStyle){
      var patternFileToCopy = {
        type: 'styles',
        src: path.join(paths.folder,patternStyle),
        dest: path.join(patternFiles.patternStylesPath,patternStyle)
      }
      patternFiles.filesToCopy.push(patternFileToCopy);
    }

    // add javascript file(s)
    if(patternObject.script){

      // get the relative path to the js file source
      var jsFileSourcePath = path.join(paths.folder,patternObject.script);

      // get the relative path to the js file destination
      var jsFileDestinationPath = path.join(patternFiles.patternScriptsPath,patternObject.script);

      // add an object about this file to the filesToWrite array
      var jsFileToCopy = {
        type: 'js',
        src: jsFileSourcePath,
        dest: jsFileDestinationPath
      }
      patternFiles.filesToCopy.push(jsFileToCopy);

    }

  }
  return patternFiles;
};
