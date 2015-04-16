'use strict';

var path = require('path');

var fsp = require('fs-promise'),
    yaml = require('js-yaml'),
    mkdirp = require('mkdirp');

var patternCompiler = require('./pattern-compiler.js'),
    cssUtils = require('./css-utils.js'),
    twigger = require('./../twig-compile').compile,
    utils = require('./../utils');


var importSinglePattern = function (paths, options) {


  fsp.readFile(path.join(paths.folder, options.dataFileName), {encoding:'utf8'})
  .then(function(patternYml){

    // create an object with data about this pattern's files
    var patternFiles = {};

    // NEW: here we'll cycle through the includes
    // patternFiles.includesCss = someReturnFromIncludesRepeat;

    // get metadata from pattern.yml file
    var patternObject = utils.convertYamlToObject(patternYml);

    // add data from patternObject to compiledYmlObject
    var compiledYmlObject = utils.createCompiledYmlObject(patternObject, paths, options);

    // get the pattern's destination directory
    var patternDestPath = utils.getPatternDestPath(compiledYmlObject, paths, options);

    // add the pattern's directory tree if it's not there
    mkdirp.sync(patternDestPath);

    // check that a template for our desired templateEngine is available
    var patternCompilerData = patternCompiler.determineCompiler(options, patternObject);

    // check that a style file for our desired cssUtils is available
    var cssUtilsData = cssUtils.determineCssCompiler(options, patternObject);

    if(cssUtilsData.src !== ''){
      // compile the style into css
      var cssCompiledContents = cssUtils.compileCss(paths, cssUtilsData);

      // get the css file name
      var cssFileName = cssUtils.cssFileName(paths.directory);

      // get the relative path to the css file
      var cssFileRelativePath = path.join(patternDestPath,cssFileName);

      // write the css file to the pattern destination path
      cssUtils.writeCss(cssFileRelativePath, cssCompiledContents);

      // add the css file to our compiled yaml object
      compiledYmlObject.css = cssFileName;

      // add our css file to patternFiles
      patternFiles.patternCss = cssFileRelativePath;

    }

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
  }, function (err) {
    console.log(err);
    throw new gutil.PluginError(PLUGIN_NAME, path.join(paths.folder, options.dataFileName) + ' does not exist');
  });
};


module.exports = importSinglePattern;
