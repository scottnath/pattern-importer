var patternImporter = require('../'),
    patternUtilities = require('../utils'),
    importSinglePattern = require('../lib/import-single-pattern'),
    patternCompiler = require('../lib/pattern-compiler'),
    cssCompiler = require('../lib/css-compiler'),
    sassCompiler = require('../lib/css-compilers/sass-compiler');
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

    it.skip('should recursively process all included templates', function () {

    });

    it.skip('should skip included templates already processed this round', function () {

    });

  });

  describe('pattern compiling', function () {

    it('should test if the pattern has been compiled (compiledPatterns) during this round', function () {

    })

    it('should skip compilation if the pattern has been compiled (compiledPatterns) during this round', function () {

    })

    it('should determine our pattern template file and compiling engine', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      var patternCompilerData = patternCompiler.determineCompiler(options, patternObject);

      patternCompilerData.should.have.property('src', './test-elm-h1.twig');
      patternCompilerData.should.have.property('templateEngine', 'twig');

    });

    it.skip('should allow the pattern to override the templateEngine via pattern.yml options', function () {

    });

    it.skip('should allow the system to override overriding the templateEngine', function () {

    });

    it('should default to an html pattern with a warning message', function () {

      var file = createFile('generic-elm-h2/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      var patternCompilerData = patternCompiler.determineCompiler(options, patternObject);

      patternCompilerData.should.have.property('src', './generic-elm-h2.html');
      patternCompilerData.should.have.property('templateEngine', 'none');

    });

    it('should determine the current template css pre-processor file type and file', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);

      var cssCompilerData = cssCompiler.determineCssCompiler(options, patternObject);

      cssCompilerData.should.have.property('src', './test-elm-h1.scss');
      cssCompilerData.should.have.property('compilingEngine', 'sass');

    });

    it('should compile the current template\'s css pre-processor file', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);
      var patternObject = patternUtilities.convertYamlToObject(file.contents);
      var cssCompilerData = cssCompiler.determineCssCompiler(options, patternObject);

      var compileCss = cssCompiler.compileCss(paths, cssCompilerData);

      String(compileCss).should.containEql('.base--h1, .base--STYLED h1 {');

    });

    it('should skip compling vanilla css', function () {

      var file = createFile('generic-elm-h2/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);
      var patternObject = patternUtilities.convertYamlToObject(file.contents);
      var cssCompilerData = cssCompiler.determineCssCompiler(options, patternObject);

      var compileCss = cssCompiler.compileCss(paths, cssCompilerData);

      String(compileCss).should.containEql('.generic-elm-h2 {');

    });

    it('should save the compiled css to the pattern destination path', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);
      var patternObject = patternUtilities.convertYamlToObject(file.contents);
      var cssCompilerData = cssCompiler.determineCssCompiler(options, patternObject);

      var compileCss = cssCompiler.compileCss(paths, cssCompilerData);

    });

    it.skip('should record the relative path to the processed css file', function () {

    });

    it('should create a list of css files to include', function () {

      var file = createFile('test-include-header/pattern.yml');
      var patternObject = patternUtilities.convertYamlToObject(file.contents);
      var paths = patternUtilities.getFilePaths(file);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);
      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);

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

    it.skip('should add the pattern to the compiledPatterns object', function () {
      // should include css/js relative paths as well
    });

  });

  describe.skip('sass compiling', function () {

    it('should compile sass into css', function () {

      var file = createFile('test-elm-h1/pattern.yml');
      var paths = patternUtilities.getFilePaths(file);
      var patternObject = patternUtilities.convertYamlToObject(file.contents);
      var cssCompilerData = cssCompiler.determineCssCompiler(options, patternObject);

      var cssOutput = sassCompiler(paths, cssCompilerData);

      String(cssOutput).should.containEql('.base--h1, .base--STYLED h1 {');

    });

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
