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
  var patternFiles = getPattern(paths, options, compiledPatterns);

  writePattern(patternFiles);

};

/**
 * Returns data on a single pattern with info about all recursive included patterns
 * @function getPattern
 *
 * @param {Array} paths path info on pattern
 * @param {Object} options pattern-importer options
 * @param {Object} compiledPatterns
 *
 * @returns {Object} patternFiles
 * @returns {Array} patternFiles.filesToWrite   array of file objects
 * @returns {String} patternFiles.filesToWrite[file].type   type of file
 * @returns {String} patternFiles.filesToWrite[file].dest   relative path to file destination
 * @returns {String} patternFiles.filesToWrite[file].contents   contents to be put in the file when we write it
 * @returns {Array} patternFiles.filesToCopy   array of file objects
 * @returns {String} patternFiles.filesToCopy[file].type   type of file
 * @returns {String} patternFiles.filesToCopy[file].src   relative path to file source
 * @returns {String} patternFiles.filesToCopy[file].dest   relative path to file destination
 * @returns {Object} patternFiles.includedFiles   Contains all css & js files required for this pattern (including included-pattern files)
 * @returns {Array} patternFiles.includedFiles.css  relative path to css file's destination
 * @returns {Array} patternFiles.includedFiles.js  relative path to js file's destination
 * @returns {String} patternFiles.patternCss  relative path for this pattern's main COMPILED css file
 * @returns {String} patternFiles.patternScript  relative path for this pattern's main js file

*/
var getPattern = function getPattern (paths, options, compiledPatterns) {

  // check if the pattern has already been compiled during this round
  if(utils.checkPatternCompiled(paths, compiledPatterns)){
    console.log('This pattern, '+paths.folder+' is already compiled');
    return compiledPatterns[paths.folder];
  }

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
      var includePatternFiles = getPattern(utils.getFilePaths(includeFile), options, compiledPatterns);
      if(includePatternFiles.patternCss !== undefined){
        patternFiles.includedFiles.css.push(includePatternFiles.patternCss);
      }
      if(includePatternFiles.patternScript !== undefined){
        patternFiles.includedFiles.js.push(includePatternFiles.patternScript);
      }
      if((includePatternFiles.filesToWrite !== undefined) && Array.isArray(includePatternFiles.filesToWrite)){
        includePatternFiles.filesToWrite.forEach(function(file){
          patternFiles.filesToWrite.push(file);
        });
      }
      if((includePatternFiles.filesToCopy !== undefined) && Array.isArray(includePatternFiles.filesToCopy)){
        includePatternFiles.filesToCopy.forEach(function(file){
          patternFiles.filesToCopy.push(file);
        });
      }
    });
  }
  // add data from patternObject to compiledYmlObject
  var compiledYmlObject = utils.createCompiledYmlObject(patternObject, paths, options);

  // get the pattern's destination directory
  var patternDestPath = utils.getPatternDestPath(compiledYmlObject, paths, options);

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
    compiledYmlObject.css = cssFileName;

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
    compiledYmlObject.script = patternObject.script;

    // add our js file to patternFiles
    patternFiles.patternScript = jsFileRelativePath;

  }

  // add an object for this pattern's data to the filesToWrite array
  var ymlFileToWrite = {
    type: 'yml',
    dest: path.join(patternDestPath,options.dataFileName),
    contents: utils.convertObjectToYaml(compiledYmlObject)
  }
  patternFiles.filesToWrite.push(ymlFileToWrite);

  /* Get data about this pattern's html template */
  var finalPatternCompilerData = patternCompiler.determineCompiler(options, patternObject, patternDestPath, paths);

  /* Compile this pattern with compileTemplate */
  var patternHtmlContent = patternCompiler.compileTemplate(finalPatternCompilerData);

  /* add patternHtmlContent to our final pattern's data */
  if(finalPatternCompilerData.data === undefined){
    finalPatternCompilerData.data = {};
  }
  finalPatternCompilerData.data.content = patternHtmlContent;

  // Turn the CSS includes into transforms
  finalPatternCompilerData.data.cssFiles = '';
  if(patternFiles.includedFiles !== undefined){
    if((patternFiles.includedFiles.css !== undefined) && Array.isArray(patternFiles.includedFiles.css)){
      finalPatternCompilerData.data.cssFiles += utils.createHtmlElements(patternFiles.includedFiles.css,options);
    }
  }

  // Turn the JS includes into transforms
  finalPatternCompilerData.data.jsFiles = '';
  if(patternFiles.includedFiles !== undefined){
    if((patternFiles.includedFiles.js !== undefined) && Array.isArray(patternFiles.includedFiles.js)){
      finalPatternCompilerData.data.jsFiles += utils.createHtmlElements(patternFiles.includedFiles.js,options);
    }
  }

  /* Add this pattern's css files to the mix */
  if(patternFiles.patternCss !== undefined){
    finalPatternCompilerData.data.cssFiles += utils.createHtmlElements(patternFiles.patternCss,options);
  }

  /* Add this pattern's js files to the mix */
  if(patternFiles.patternScript !== undefined){
    finalPatternCompilerData.data.jsFiles += utils.createHtmlElements(patternFiles.patternScript,options);
  }


  /* reference our template donut to use for final pattern compiling */
  if(options.templateDonut){
    finalPatternCompilerData.src = options.templateDonut[options.templateEngine];
  }

  // get some data into our final template
  finalPatternCompilerData.data.patternName = patternObject.name;
  finalPatternCompilerData.data.patternDesc = patternObject.description;

  /* Compile this pattern with compileTemplate */
  var completePatternHtmlContent = patternCompiler.compileTemplate(finalPatternCompilerData);

  /* add the main pattern file to our list of files-to-write */
  var patternFileToWrite = {
    type: 'pattern',
    dest: finalPatternCompilerData.dest,
    contents: completePatternHtmlContent
  }
  patternFiles.filesToWrite.push(patternFileToWrite);

  // add this pattern's data to our compiled patterns object
  utils.addPatternToCompiledPatterns(paths, patternFiles, compiledPatterns);

  return patternFiles;

}

/**
 * Writes pattern files to the file system
 * @function writePattern
 *
 */
var writePattern = function writePattern (patternFiles) {

  // write included files (like css/js) we had to compile
  if((patternFiles.filesToWrite !== undefined) && Array.isArray(patternFiles.filesToWrite)){
    patternFiles.filesToWrite.forEach(function(file){
      utils.writeFile(file.dest, file.contents);
    });
  }

  // copy over included files which didn't require compilation
  if((patternFiles.filesToCopy !== undefined) && Array.isArray(patternFiles.filesToCopy)){
    patternFiles.filesToCopy.forEach(function(file){
      utils.copyFile(file.src, file.dest);
    });
  }

}


module.exports = {
  importSinglePattern: importSinglePattern,
  getPattern: getPattern,
  writePattern: writePattern
};
