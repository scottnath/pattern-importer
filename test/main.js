var patternImporter = require('../'),
    patternUtilities = require('../lib/utils'),
    plUtils = require('pattern-library-utilities'),
    importSinglePattern = require('../lib/import-single-pattern'),
    patternCompiler = require('../lib/pattern-compiler'),
    cssUtils = require('../lib/css-utils.js');
var should = require('should');
var chai = require('chai');
var expect = chai.expect;
var gutil = require('gulp-util');
var File = require('vinyl');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');

// create our options
var options = {
  compilePatternsOnImport: false,
  dataSource: 'pattern',
  dataFileName: 'pattern.yml',
  patternImportDest: './test/_patterns',
  htmlTemplateDest: './source',
  stylesDest: './source/css/scss',
  cssCompiler: 'sass', // sass, less, stylus, none
  templateEngine: 'twig',
  templateDonut: {
    'twig': './templates/donut.twig'
  },
  uncategorizedDir: 'uncategorized'
};

var createTestFilePath = function(filePath) {
  
  return path.join(__filename, '..', 'fixtures', filePath);

};

describe('test file ', function () {

  it('should create proper file paths', function () {

    var filePath = createTestFilePath('test-elm-h1/pattern.yml');
    String(filePath).should.containEql('test/fixtures/test-elm-h1/pattern.yml');

  })
});

describe('pattern-importing', function () {

  describe('pattern utilities', function () {

    it('should return pattern paths', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);

      String(paths.absolute).should.equal(path.join(path.resolve(),'test/fixtures/test-elm-h1/pattern.yml'));
      String(paths.relative).should.equal('test/fixtures/test-elm-h1/pattern.yml');
      String(paths.folder).should.equal('test/fixtures/test-elm-h1');
      String(paths.directory).should.equal('test-elm-h1');

    });

    it('should convert yaml data to an object', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var patternObject = plUtils.convertYamlToObject(file.contents);

      patternObject.should.have.property('name', 'Heading Level 1 Test H1');
      patternObject.should.have.property('description', 'First level heading inside a test');
      patternObject.should.have.property('category', 'base');
      patternObject.should.have.property('twig', './test-elm-h1.twig');
      patternObject.should.have.property('sass', './test-elm-h1.scss');

    });

    it('should create the compiled yaml object', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);

      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      compiledYmlObject.should.have.property('name', 'Heading Level 1 Test H1');
      compiledYmlObject.should.have.property('description', 'First level heading inside a test');
      compiledYmlObject.should.have.property('category', 'base');
      compiledYmlObject.should.have.property('dataSource', 'pattern');
      compiledYmlObject.should.have.property('source', 'test/fixtures/test-elm-h1');
      compiledYmlObject.should.have.property('subcategory', 'subcatbase');

    });

    it.skip('should get the template options from the template data file', function () {

    });

    it('should get a pattern category path', function () {

      var file = plUtils.createFile(createTestFilePath('base/test-img/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);

      patternCategoryPath.should.equal('base');

    });

    it('should get a pattern category path with a subcategory', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);

      patternCategoryPath.should.equal('base/subcatbase');

    });

    it('should get an uncategorized pattern category path', function () {

      var file = plUtils.createFile(createTestFilePath('generic-elm-h2/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);

      patternCategoryPath.should.equal('uncategorized');

    });

    it('should get an options-defined uncategorized pattern category path', function () {

      options.uncategorizedDir = 'made-up-directory';
      var file = plUtils.createFile(createTestFilePath('generic-elm-h2/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);

      patternCategoryPath.should.equal('made-up-directory');

    });

    it('should get a pattern destination path', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);

      patternDestPath.should.equal('test/_patterns/base/subcatbase/test-elm-h1');

    });

  });

  describe('pattern compiling', function () {

    it('should test if the pattern has been compiled during this round', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var pathsTestIncludeHeader = plUtils.getFilePaths(file);
      var file = plUtils.createFile(createTestFilePath('components/test-newsblock/pattern.yml'));
      var pathsTestNewsblock = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      expect(compiledPatterns[pathsTestIncludeHeader.folder]).to.be.undefined;
      expect(compiledPatterns[pathsTestNewsblock.folder]).to.be.undefined;

      var patternFiles = importSinglePattern.getPattern(pathsTestIncludeHeader, options, compiledPatterns);
      expect(compiledPatterns[pathsTestIncludeHeader.folder]).to.be.defined;
      expect(compiledPatterns[pathsTestNewsblock.folder]).to.be.defined;
      patternUtilities.checkPatternCompiled(pathsTestIncludeHeader, compiledPatterns).should.equal(true);
      patternUtilities.checkPatternCompiled(pathsTestNewsblock, compiledPatterns).should.equal(false);

      var patternFiles = importSinglePattern.getPattern(pathsTestNewsblock, options, compiledPatterns);
      patternUtilities.checkPatternCompiled(pathsTestNewsblock, compiledPatterns).should.equal(true);

    })

    it('should determine our pattern template file and compiling engine', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);
      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);

      var patternCompilerData = patternCompiler.determineCompiler(options, patternObject, patternDestPath, paths);
      patternCompilerData.should.have.property('src', 'test/fixtures/test-elm-h1/test-elm-h1.twig');
      patternCompilerData.should.have.property('dest', 'test/_patterns/base/subcatbase/test-elm-h1/test-elm-h1.html');
      patternCompilerData.should.have.property('templateEngine', 'twig');

    });

    it.skip('should allow the pattern to override the templateEngine via pattern.yml options', function () {

    });

    it.skip('should allow the system to override overriding the templateEngine', function () {

    });

    it('should default to an html pattern with a warning message', function () {

      var file = plUtils.createFile(createTestFilePath('generic-elm-h2/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);
      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);

      var patternCompilerData = patternCompiler.determineCompiler(options, patternObject, patternDestPath, paths);
      patternCompilerData.should.have.property('src', 'test/fixtures/generic-elm-h2/generic-elm-h2.html');
      patternCompilerData.should.have.property('dest', 'test/_patterns/uncategorized/generic-elm-h2/generic-elm-h2.html');
      patternCompilerData.should.have.property('templateEngine', 'none');

    });

    it('should determine the current template css pre-processor file type and file', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var patternObject = plUtils.convertYamlToObject(file.contents);

      var cssCompilerData = cssUtils.determineCssCompiler(options, patternObject);

      cssCompilerData.should.have.property('src', './test-elm-h1.scss');
      cssCompilerData.should.have.property('compilingEngine', 'sass');

    });

    it('should compile the current template\'s css pre-processor file', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var cssCompilerData = cssUtils.determineCssCompiler(options, patternObject);

      var compileCss = cssUtils.compileCss(paths, cssCompilerData);

      String(compileCss).should.containEql('.base--h1, .base--STYLED h1 {');

    });

    it('should skip compling vanilla css', function () {

      var file = plUtils.createFile(createTestFilePath('generic-elm-h2/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var cssCompilerData = cssUtils.determineCssCompiler(options, patternObject);

      var cssCompiledContents = cssUtils.compileCss(paths, cssCompilerData);

      String(cssCompiledContents).should.containEql('.generic-elm-h2 {');

    });

    it('should create the css file name', function () {

      var cssFileName = cssUtils.cssFileName('test123');
      String(cssFileName).should.equal('test123.css');

    });

    it('should know the primary pattern\'s post-compile css file relative path', function () {

      var patternFiles = {};
      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);
      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);
      var cssUtilsData = cssUtils.determineCssCompiler(options, patternObject);

      if(cssUtilsData.src !== undefined){
        var cssFileName = cssUtils.cssFileName(paths.directory);
        var cssFileRelativePath = path.join(patternDestPath,cssFileName);
        patternFiles.patternCss = cssFileRelativePath;
      }

      String(patternFiles.patternCss).should.equal('test/_patterns/base/subcatbase23/test-include-header/test-include-header.css');

    });

    it('should know the primary pattern\'s javascript file relative path', function () {

      var patternFiles = {};
      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);
      var patternDestPath = patternUtilities.getPatternDestPath(compiledYmlObject, paths, options);
      var cssUtilsData = cssUtils.determineCssCompiler(options, patternObject);

      if(patternObject.script !== undefined){
        var jsFileSourcePath = path.join(paths.folder,patternObject.script);
        var jsFileRelativePath = path.join(patternDestPath,patternObject.script);
        patternFiles.patternScript = jsFileRelativePath;
      }

      String(patternFiles.patternScript).should.equal('test/_patterns/base/subcatbase23/test-include-header/test-include-header.js');

    });

    it('should create a list of included-pattern(s) css files', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);
      patternFiles.includedFiles.css.should.eql(['test/_patterns/uncategorized/generic-elm-h2/generic-elm-h2.css','test/_patterns/base/subcatbase/test-elm-h1/test-elm-h1.css','test/_patterns/base/sometestsubcat/test-elm-p/test-elm-p.css']);

    });

    it('should create a list of included-pattern(s) js files', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);
      patternFiles.includedFiles.js.should.eql(['test/_patterns/base/subcatbase/test-elm-h1/test-elm-h1.js','test/_patterns/base/sometestsubcat/test-elm-p/test-elm-p.js']);

    });

    it('should convert the css list to html link elements', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);

      var cssHtml = patternUtilities.createHtmlElements(patternFiles.includedFiles.css);
      String(cssHtml).should.containEql('<link rel="stylesheet" href="test/_patterns/uncategorized/generic-elm-h2/generic-elm-h2.css">\n');

    });

    it('should convert the js list to html script elements', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);

      var jsHtml = patternUtilities.createHtmlElements(patternFiles.includedFiles.js);
      String(jsHtml).should.containEql('<script src="test/_patterns/base/subcatbase/test-elm-h1/test-elm-h1.js"></script>\n');
      String(jsHtml).should.containEql('<script src="test/_patterns/base/sometestsubcat/test-elm-p/test-elm-p.js"></script>\n');

    });

    it.skip('should convert the template to html', function () {

    });

    it.skip('should write the html to a file', function () {

    });

    it.skip('should add the pattern to the compiledPatterns object', function () {
      // should include css/js relative paths as well
    });

  });

  describe.skip('file writing', function () {


    it.skip('should save the compiled css to the pattern destination path', function () {

      // var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      // var paths = plUtils.getFilePaths(file);
      // var patternObject = plUtils.convertYamlToObject(file.contents);
      // var cssCompilerData = cssUtils.determineCssCompiler(options, patternObject);

      // var cssCompiledContents = cssUtils.compileCss(paths, cssCompilerData);

      // need help for this test - how to read/write?


    });

  })

  // describe('pattern importer', function() {

  //   it('should write an html file', function() {

      // var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
  //     var imported = patternImporter(file);

  //     console.log(file);
  //     console.log(imported);

  //   })
  // });
});
