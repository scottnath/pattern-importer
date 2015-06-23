'use strict';
var through = require('through2'),
    utils = require('../lib/utils'),
    importSinglePattern = require('../lib/import-single-pattern'),
    getPatternImportData = require('../lib/get-pattern-import-data'),
    patternCompiler = require('../lib/pattern-compiler'),
    plUtils = require('pattern-library-utilities'),
    gutil = require('gulp-util'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer';

/*
 * Imports html patterns that are following the standards at github.com/pattern-library
 *
 * @param {Object} options
*/
module.exports = function patternImporter (options) {

  options = utils.getOptions(options);

  // make the pattern target destination folder
  mkdirp.sync(options.patternImportDest);

  // array to keep track of compiled patterns
  var compiledPatterns = [];

  var stream = through.obj(function (file, encoding, cb) {

    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported'));
      return cb();
    }

    /* get path details for our pattern */
    var paths = plUtils.getFilePaths(file);

    var patternFiles = getPatternImportData(paths, options);

    /* check if system will be compiling the templates */
    if(options.compilePatternsOnImport){
      var newFilesToCopy = [];
      patternFiles.filesToCopy.forEach(function(file){
        if(file.type === 'pattern'){
          /* Get data about this pattern's html template */
          var finalPatternCompilerData = patternCompiler.determineCompiler(options, patternFiles, file, paths);

          if(finalPatternCompilerData.templateEngine !== 'none'){

            /* Use templating engine to get the final html content */
            var patternHtmlContent = patternCompiler.compileTemplate(finalPatternCompilerData,options);

            /* add file to our filesToWrite array */
            patternFiles.filesToWrite.push({
              'type': 'pattern',
              'dest': path.join(patternFiles.patternTemplatePath,paths.directory+'.html'),
              'contents': patternHtmlContent
            });
          } else {
            newFilesToCopy.push(file);
          }
        } else {
          newFilesToCopy.push(file);
        }

      });
      patternFiles.filesToCopy = newFilesToCopy;
    }

    /* send our pattern's files to be copied or written */
    utils.writeCopyFiles(patternFiles);

    this.push(file);
    cb();
  });

  return stream;

}
