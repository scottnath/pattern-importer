'use strict';
var path = require('path'),
    sass = require('node-sass');

//var cssFileName = patternDirName + '.css';


/**
 * Compiles our styles using the SASS compiling engine
 *
 */
var sassCompiler = function sassCompiler (paths, cssCompilerData) {

  var result = sass.renderSync({
    file: path.join(paths.folder, cssCompilerData.src)
  });

  return result.css.toString().trim();
}

module.exports = sassCompiler;
