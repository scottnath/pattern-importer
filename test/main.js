var patternImporter = require('../'),
    patternUtilities = require('../utils'),
    importSinglePattern = require('../lib/import-single-pattern'),
    patternCompiler = require('../lib/pattern-compiler');
var should = require('should');
var chai = require('chai');
var expect = chai.expect;
var gutil = require('gulp-util');
var File = require('vinyl');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');

var createFile = function(filePath, type) {
  var contents;
  var filePath = path.join(__filename, '..', 'fixtures', filePath);

  if (type == 'stream') {
    contents = fs.createReadStream(filePath);
  } else {
    contents = fs.readFileSync(filePath);
  }

  return new File({
    path: filePath,
    cwd: 'test/',
    base: 'test/fixtures',
    contents: contents
  });
};

// create our options
var options = {
  dataSource: 'pattern',
  dataFileName: 'pattern.yml',
  patternImportDest: './test/_patterns',
  cssCompiler: 'sass', // sass, less, stylus, none
  templateEngine: 'twig'
};

describe('pattern-importing', function () {

  describe('pattern utilities', function () {

    it('should return pattern paths', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);

      String(paths.absolute).should.equal(path.join(path.resolve(),'test/fixtures/test-elm-h1/pattern.yml'));
      String(paths.relative).should.equal('test/fixtures/test-elm-h1/pattern.yml');
      String(paths.folder).should.equal('test/fixtures/test-elm-h1');
      String(paths.directory).should.equal('test-elm-h1');

    });

    it('should convert yaml data to an object', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      patternObject.should.have.property('name', 'Heading Level 1 Test H1');
      patternObject.should.have.property('description', 'First level heading inside a test');
      patternObject.should.have.property('category', 'base');
      patternObject.should.have.property('twig', './test-elm-h1.twig');
      patternObject.should.have.property('sass', './test-elm-h1.scss');

    });

    it('should create the compiled yaml object', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      compiledYmlObject.should.have.property('name', 'Heading Level 1 Test H1');
      compiledYmlObject.should.have.property('description', 'First level heading inside a test');
      compiledYmlObject.should.have.property('category', 'base');
      compiledYmlObject.should.have.property('data', 'pattern');
      compiledYmlObject.should.have.property('source', 'test/fixtures/test-elm-h1');
      compiledYmlObject.should.have.property('subcategory', 'subcatbase');

    });

    it.skip('should get the template options from the template data file', function () {

    });

    it('should get a pattern destination path', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);
      var patternObject = patternUtilities.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);

      patternDestPath.should.equal('test/_patterns/base/subcatbase/test-elm-h1');

    });

  });

  describe('pattern compiling', function () {

    it('should determine our pattern template file and compiling engine', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      var compileeObject = patternCompiler.determineCompiler(options, patternObject);

      compileeObject.should.have.property('src', './test-elm-h1.twig');
      compileeObject.should.have.property('templateEngine', 'twig');

    });

    it.skip('should allow the pattern to override the templateEngine via pattern.yml options', function () {

    });

    it.skip('should allow the system to override overriding the templateEngine', function () {

    });

    it('should default to an html pattern with a warning message', function () {

      var file = createFile('generic-elm-h2/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      var compileeObject = patternCompiler.determineCompiler(options, patternObject);

      compileeObject.should.have.property('src', './generic-elm-h2.html');
      compileeObject.should.have.property('templateEngine', 'none');

    });

    it('should create a list of css files to include', function () {

    });

    it.skip('should convert the css list to html link elements', function () {

    });

    it.skip('should create a list of js files to include', function () {

    });

    it.skip('should convert the js list to html script elements', function () {

    });

    it.skip('should convert the template to html', function () {

    });

    it.skip('should write the html to a file', function () {

    });

    // it('should repeat import-single-pattern recursively through all included templates', function () {

    // });

  });

  describe.skip('twig compiling', function () {


    it('should get the template donut', function () {

    });

    it('should convert twig syntax into html', function () {

    });

    it('should compile supporting templates into a single html page', function () {

    });

  });

  // describe('pattern importer', function() {

  //   it('should write an html file', function() {

  //     var file = createFile('test-elm-h1/pattern.yml');
  //     var imported = patternImporter(file);

  //     console.log(file);
  //     console.log(imported);

  //   })
  // });
});
