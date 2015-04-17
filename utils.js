'use strict';

var path = require('path'),
    fs = require('fs-extra'),
    fsp = require('fs-promise'),
    yaml = require('js-yaml'),
    File = require('vinyl');

/**
 * Returns an object of file path data
 * @function getFilePaths
 *
 */
var getFilePaths = function (file) {
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
 * Returns an object from yaml-data-created object
 * @function convertYamlToObject
 *
 */
var createCompiledYmlObject = function createCompiledYmlObject (object, paths, options) {
  var compiledYml = {};

  // start putting pattern data into compiledYml object
  compiledYml.name = object.name;

  // source will be the location of the pattern in this project
  compiledYml.source = paths.folder;

  // source of the DATA used - NATH: this section will change with addition of func to add LIVE/LOCAL data
  compiledYml.data = options.dataSource;

  // if there is a description, we'll add that to the compiledYml object
  if (object.description) {
    compiledYml.description = object.description
  }

  // if there are includes, we'll add that to the compiledYml object
  if (object.includes) {
    compiledYml.includes = object.includes
  }

  compiledYml.categoryUrl = '';
  // if there is a category, we'll put this pattern into that category's subfolder
  if (object.category) {

    // add category to compiledYml
    compiledYml.category = compiledYml.categoryUrl = object.category

  } else {
    compiledYml.category = compiledYml.categoryUrl = 'uncategorized';
  }

  // if there is a category, we'll put this pattern into that category's subfolder
  if (object.subcategory) {

    // add category to compiledYml
    compiledYml.subcategory = object.subcategory
    compiledYml.categoryUrl = path.join(object.category,object.subcategory);

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
        var includeFile = new File({
          base: path.join(paths.folder, include),
          path: path.join(paths.folder, include, options.dataFileName),
          contents: new Buffer(fs.readFileSync(path.join(paths.folder, include, options.dataFileName), {encoding:'utf8'}))
        });
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

  fsp.writeFile(dest, contents)
    .then(function(){
      console.log('File written: '+dest);
    });
};

/**
 * Copies a file from one place to another
 * @function copyFile
 *
 */
var copyFile = function copyFile (src, dest) {
  console.log(src);
  console.log(dest);
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
 * Updates our compiledPatterns object with details about this pattern and its includes
 * @function addPatternToCompiledPatterns
 *
 */
var addPatternToCompiledPatterns = function addPatternToCompiledPatterns (paths, patternFiles, compiledPatterns) {

  compiledPatterns[paths.folder] = {
    css: getPatternCssFilesArray(patternFiles),
    js: getPatternJsFilesArray(patternFiles)
  }
}



module.exports = {
	getFilePaths: getFilePaths,
  convertYamlToObject: convertYamlToObject,
  createCompiledYmlObject: createCompiledYmlObject,
  getPatternDestPath: getPatternDestPath,
  writeFile: writeFile,
  copyFile: copyFile,
  createFile: createFile,
  getPatternCssFilesArray: getPatternCssFilesArray,
  getPatternJsFilesArray: getPatternJsFilesArray,
  addPatternToCompiledPatterns: addPatternToCompiledPatterns
}
