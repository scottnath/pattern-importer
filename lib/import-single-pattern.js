'use strict';

var path = require('path');

var fsp = require('fs-promise'),
    yaml = require('js-yaml'),
    mkdirp = require('mkdirp');

var patternCompiler = require('./pattern-compiler.js'),
    cssCompiler = require('./css-compiler.js'),
    twigger = require('./../twig-compile').compile,
    utils = require('./../utils');


var importSinglePattern = function (paths, options) {
  console.log('importSinglePattern');
  console.log(path.join(paths.folder, options.dataFileName));
  var patternCatDir = '',
      srcPatternTemplate;
  /* NATH: TEST TO ADD
    pattern.yml exists
  */
    /* REPEATER
    * open pattern.yml
    * discover twig
    * write twig->html
    * write sass->css
    * write js
    * write compiled.yml
    * cycle through includes
    */


  fsp.readFile(path.join(paths.folder, options.dataFileName), {encoding:'utf8'})
  .then(function(patternYml){

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

    // check that a style file for our desired cssCompiler is available
    var cssCompilerData = cssCompiler.determineCssCompiler(options, patternObject);

    // compile the style into css
    var cssCompiledContents = cssCompiler.compileCss(paths, cssCompilerData);
    console.log('cssCompiledContents');
    console.log(cssCompiledContents);
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
  });
};


module.exports = importSinglePattern;
