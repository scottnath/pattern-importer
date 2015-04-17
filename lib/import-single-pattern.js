'use strict';

var path = require('path'),
    fs = require('fs');

var yaml = require('js-yaml'),
    mkdirp = require('mkdirp'),
    through = require('through2');

var patternCompiler = require('./pattern-compiler.js'),
    cssUtils = require('./css-utils.js'),
    twigger = require('./../twig-compile').compile,
    utils = require('./../utils');

var File = require('vinyl');

var importSinglePattern = function (file, options, compiledPatterns) {

  var paths = utils.getFilePaths(file);
  /*
   NATH: there should be error checking here to check if this pattern has been compiled already
   */
  var patternFiles = getPatternData(paths, options, compiledPatterns);

  writePatternFiles(patternFiles);
    /* NATH: UR HERE

    to compile the template I need
    * includes' (recurse) list of css & list of js
      * css/js can only known if templates are already built and compiled

    */

    // var destinationHtml = path.join(patternDestPath,patternDirName +'.html');
    // if (options.templateEngine === 'twig') {
    //   twigger(path.join(patternFolder,srcPatternTemplate),destinationHtml,meta.data);
    // } else if (options.templateEngine === 'swig') {
    //   // here is where you would process swig files
    // } else if (options.templateEngine === 'moustache') {
    //   // you should be seeing a pattern in how this works by now
    // } else {
    //   // if we get here, we're just gonna copy our html file as is
    //   fsp.writeFile(destinationHtml, path.join(patternFolder,srcPatternTemplate))
    //   .then(function(){
    //     console.log(path.basename(dest) + ' template rendered');
    //   });
    // }

};

var getPatternData = function getPatternData (paths, options, compiledPatterns) {

  var patternYml = fs.readFileSync(path.join(paths.folder, options.dataFileName), {encoding:'utf8'});

  // create an object with data about this pattern's files
  var patternFiles = {};
  patternFiles.filesToWrite = [];
  patternFiles.filesToCopy = [];

  // get metadata from pattern.yml file
  var patternObject = utils.convertYamlToObject(patternYml);

  // Go through an included files listed in pattern.yml
  if(patternObject.includes){
    patternFiles.includedFiles = {
      css: [],
      js: []
    };

    // cycle through each of our includes
    patternObject.includes.forEach(function (include){

      // create a vinyl version of the include's pattern.yml
      var includeFile = utils.createFile(path.join(paths.folder, include, options.dataFileName), process.cwd(), path.join(paths.folder, include));

      // compile the pattern, return it's included files
      var includePatternFiles = getPatternData(utils.getFilePaths(includeFile), options, compiledPatterns);
      if(includePatternFiles.patternCss !== undefined){
        patternFiles.includedFiles.css.push(includePatternFiles.patternCss);
      }
      if(includePatternFiles.patternScript !== undefined){
        patternFiles.includedFiles.js.push(includePatternFiles.patternScript);
      }
      if(includePatternFiles.filesToWrite !== undefined){
        patternFiles.filesToWrite.push(includePatternFiles.filesToWrite);
      }
      if((includePatternFiles.filesToCopy !== undefined) && Array.isArray(includePatternFiles.filesToCopy)){
        includePatternFiles.filesToCopy.forEach(function(file){
          patternFiles.filesToCopy.push(file);
        });
      }
    });
  }

  // add data from patternObject to compiledYmlObject
  patternFiles.compiledYmlObject = utils.createCompiledYmlObject(patternObject, paths, options);

  // get the pattern's destination directory
  var patternDestPath = utils.getPatternDestPath(patternFiles.compiledYmlObject, paths, options);

  // check that a template for our desired templateEngine is available
  var patternCompilerData = patternCompiler.determineCompiler(options, patternObject);

  // check that a style file for our desired cssUtils is available
  var cssUtilsData = cssUtils.determineCssCompiler(options, patternObject);

  if(cssUtilsData.src !== undefined){
    // compile the style into css
    var cssCompiledContents = cssUtils.compileCss(paths, cssUtilsData);

    // get the css file name
    var cssFileName = cssUtils.cssFileName(paths.directory);

    // get the relative path to the css file destination
    var cssFileRelativePath = path.join(patternDestPath,cssFileName);

    // add an object about this file to the filesToWrite array
    var cssFileToWrite = {
      type: 'css',
      dest: cssFileRelativePath,
      contents: cssCompiledContents
    }
    patternFiles.filesToWrite.push(cssFileToWrite);

    // add the css file to our compiled yaml object
    patternFiles.compiledYmlObject.css = cssFileName;

    // add our css file to patternFiles
    patternFiles.patternCss = cssFileRelativePath;

  }

  if(patternObject.script !== undefined){

    // get the relative path to the js file source
    var jsFileSourcePath = path.join(paths.folder,patternObject.script);

    // get the relative path to the js file destination
    var jsFileRelativePath = path.join(patternDestPath,patternObject.script);

    // add an object about this file to the filesToWrite array
    var jsFileToCopy = {
      type: 'js',
      src: jsFileSourcePath,
      dest: jsFileRelativePath
    }
    patternFiles.filesToCopy.push(jsFileToCopy);

    // add the js file to our compiled yaml object
    patternFiles.compiledYmlObject.script = patternObject.script;

    // add our js file to patternFiles
    patternFiles.patternScript = jsFileRelativePath;

  }

  // add this pattern's data to our compiled patterns object
  utils.addPatternToCompiledPatterns(paths, patternFiles, compiledPatterns);

  return patternFiles;

}

var writePatternFiles = function writePatternFiles (patternFiles) {

/*
to do
  make path
  write files
  function: write html files
  function: write compiled.yml files
*/
  patternFiles.filesToWrite.forEach(function(file){
    // console.log('filesToWrite: file');
    // console.log(file);
  });

  patternFiles.filesToCopy.forEach(function(file){

    // add the pattern's directory tree if it's not there
    //mkdirp.sync(patternDestPath);
    // console.log('filesToCopy: file');
    // console.log(file);
  });
}


module.exports = {
  importSinglePattern: importSinglePattern,
  getPatternData: getPatternData,
  writePatternFiles: writePatternFiles
};
