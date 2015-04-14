'use strict';

var path = require('path'),
    fsp = require('fs-promise'),
    yaml = require('js-yaml');

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
  console.log(object.categoryUrl);
  return path.join(options.patternImportDest, object.categoryUrl, paths.directory);

}

// var writeFile = function (file) {
//   console.log('I WROTE that WORKER!');
//   fsp.writeFile('hello1.txt', 'hello world')
//     .then(function(){
//       console.log('I WROTE that!');
//       console.log(contents);
//       return fsp.readFile('hello1.txt', {encoding:'utf8'});
//     })
//     .then(function(contents){
//       console.log('I Read that!');
//       console.log(contents);
//     });
// };

// var readFile = function (file) {
//   fsp.readFile('hello1.txt', {encoding:'utf8'})
//     .then(function(contents){
//       console.log('I Read that!');
//       console.log(contents);
//       return contents;
//     });
// };



module.exports = {
	getFilePaths: getFilePaths,
  convertYamlToObject: convertYamlToObject,
  createCompiledYmlObject: createCompiledYmlObject,
  getPatternDestPath: getPatternDestPath
}
