var patternImporter = require('../'),
    patternUtilities = require('../lib/utils'),
    plUtils = require('pattern-library-utilities'),
    importSinglePattern = require('../lib/import-single-pattern'),
    getPatternImportData = require('../lib/get-pattern-import-data'),
    patternCompiler = require('../lib/pattern-compiler'),
    cssUtils = require('../lib/css-utils.js'),
    convertTwigIncludesPaths = require('../lib/convert-twig-includes-paths.js');
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
  htmlTemplateDest: './test',
  stylesDest: './test/css/scss',
  scriptsDest: './test/js',
  cssCompiler: 'sass', // sass, less, stylus, none
  templateEngine: 'twig',
  templateEngineOptions: {
    'base': './test/fixtures/',
    'async': false
  },
  templateDonut: {
    'twig': './templates/donut.twig'
  },
  convertCategoryTitles: true,
  convertCategoryTitlesData: {
    "categories": {
      "base": "00-atoms",
      "atoms": "00-atoms",
      "molecules": "01-molecules",
      "components": "02-organisms",
      "organisms": "02-organisms",
      "templates": "03-templates",
      "pages": "04-pages"
    },
    "subcategories": {
      "00-atoms": {
        "global": "00-global",
        "text": "01-text",
        "lists": "02-lists",
        "images": "03-images",
        "forms": "04-forms",
        "buttons": "05-buttons",
        "tables": "06-tables",
        "media": "07-media"
      },
      "01-molecules": {
        "text": "00-text",
        "layout": "01-layout",
        "blocks": "02-blocks",
        "media": "03-media",
        "forms": "04-forms",
        "navigation": "05-navigation",
        "components": "06-components",
        "messaging": "07-messaging",
        "global": "08-global"
      },
      "02-organisms": {
        "global": "00-global",
        "article": "01-article",
        "comments": "02-comments",
        "components": "03-components",
        "sections": "04-sections"
      }
    }
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
      patternCategoryPath.should.equal('00-atoms');

      options.convertCategoryTitles = false;
      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);
      patternCategoryPath.should.equal('base');
      options.convertCategoryTitles = true;

    });

    it('should get a pattern category path with a subcategory', function () {

      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternObject = plUtils.convertYamlToObject(file.contents);
      var compiledYmlObject = patternUtilities.createCompiledYmlObject(patternObject, paths, options);

      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);
      patternCategoryPath.should.equal('00-atoms/subcatbase');
      
      options.convertCategoryTitles = false;
      var patternCategoryPath = patternUtilities.getCategoryPath(patternObject, options);
      patternCategoryPath.should.equal('base/subcatbase');
      options.convertCategoryTitles = true;

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

      patternDestPath.should.equal('test/base/subcatbase/test-elm-h1');

    });

  });

  describe('pattern compiling', function () {


    it('should determine know a destination and the final compiled html', function () {
      var compileOptions = options;
      compileOptions.compilePatternsOnImport = true;
      var file = plUtils.createFile(createTestFilePath('test-elm-h1/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var patternFiles = getPatternImportData(paths, compileOptions);

      patternFiles.should.have.property('filesToWrite');
      patternFiles.filesToWrite[0].should.have.property('dest', 'test/00-atoms/subcatbase/test-elm-h1.html');
      patternFiles.filesToWrite[0].should.have.property('contents', '<h1 class="test--h1">Test Header 1</h1>\n');

    });

    it.skip('should allow the pattern to override the templateEngine via pattern.yml options', function () {

    });

    it.skip('should allow the system to override overriding the templateEngine', function () {

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

      String(patternFiles.patternCss).should.equal('test/base/subcatbase23/test-include-header/test-include-header.css');

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

      String(patternFiles.patternScript).should.equal('test/base/subcatbase23/test-include-header/test-include-header.js');

    });

    it.skip('should create a list of included-pattern(s) css files', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);
      patternFiles.includedFiles.css.should.eql(['test/uncategorized/generic-elm-h2/generic-elm-h2.css','test/base/subcatbase/test-elm-h1/test-elm-h1.css','test/base/sometestsubcat/test-elm-p/test-elm-p.css']);

    });

    it.skip('should create a list of included-pattern(s) js files', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);
      patternFiles.includedFiles.js.should.eql(['test/base/subcatbase/test-elm-h1/test-elm-h1.js','test/base/sometestsubcat/test-elm-p/test-elm-p.js']);

    });

    it.skip('should convert the css list to html link elements', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);

      var cssHtml = patternUtilities.createHtmlElements(patternFiles.includedFiles.css);
      String(cssHtml).should.containEql('<link rel="stylesheet" href="test/uncategorized/generic-elm-h2/generic-elm-h2.css">\n');

    });

    it.skip('should convert the js list to html script elements', function () {

      var file = plUtils.createFile(createTestFilePath('components/test-include-header/pattern.yml'));
      var paths = plUtils.getFilePaths(file);
      var compiledPatterns = [];
      var patternFiles = importSinglePattern.getPattern(paths, options, compiledPatterns);

      var jsHtml = patternUtilities.createHtmlElements(patternFiles.includedFiles.js);
      String(jsHtml).should.containEql('<script src="test/base/subcatbase/test-elm-h1/test-elm-h1.js"></script>\n');
      String(jsHtml).should.containEql('<script src="test/base/sometestsubcat/test-elm-p/test-elm-p.js"></script>\n');

    });

    it.skip('should write the html to a file', function () {

    });

    it.skip('should add the pattern to the compiledPatterns object', function () {
      // should include css/js relative paths as well
    });

  });

  describe('twig functions', function () {

    it('should extract a file path from a twig include', function () {
      // double quote test
      var twigInclude = '{% include "link/to/some/twigFile.twig" %}';
      var includePath = convertTwigIncludesPaths.extractTwigIncludePath(twigInclude);
      String(includePath).should.containEql('link/to/some/twigFile.twig');
      // single quote test
      var twigInclude = "{% include 'link/to/some/twigFile.twig' %}";
      var includePath = convertTwigIncludesPaths.extractTwigIncludePath(twigInclude);
      String(includePath).should.containEql('link/to/some/twigFile.twig');
      // more complex code test
      var twigInclude = "{% include 'link/to/some/twigFile.twig' with {'promo': hero} %}";
      var includePath = convertTwigIncludesPaths.extractTwigIncludePath(twigInclude);
      String(includePath).should.containEql('link/to/some/twigFile.twig');
    });

    it('should create new file paths from categories', function () {
      // two-category path
      var twoCatPath = 'base/global/pattern1/pattern1.twig';
      var newPath = convertTwigIncludesPaths.createNewCategoryPath(options,twoCatPath);
      String(newPath).should.containEql('00-atoms/00-global/pattern1.twig');
      // one-category path
      var oneCatPath = 'templates/pattern1/pattern1.twig';
      var newPath = convertTwigIncludesPaths.createNewCategoryPath(options,oneCatPath);
      String(newPath).should.containEql('03-templates/pattern1.twig');
      // unmatched category path
      var nomatchCatPath = 'nomatch/pattern1/pattern1.twig';
      var newPath = convertTwigIncludesPaths.createNewCategoryPath(options,nomatchCatPath);
      String(newPath).should.containEql('nomatch/pattern1.twig');
    });

    it('should convert all includes in a single twig file', function () {
      var twigFile = plUtils.createFile(createTestFilePath('molecules/media/figure-image/figure-image.twig'));
      // with conversion
      var twigContent = convertTwigIncludesPaths.convertTwigIncludes(options,twigFile.contents.toString('utf8'));
      String(twigContent).should.containEql("{% include '00-atoms/03-images/img.twig' with img %}");
      String(twigContent).should.not.containEql("{% include 'atoms/images/img/img.twig' with img %}");

      //without conversion
      options.convertCategoryTitles = false;
      var twigContent = convertTwigIncludesPaths.convertTwigIncludes(options,twigFile.contents.toString('utf8'));
      String(twigContent).should.not.containEql("{% include '00-atoms/03-images/img.twig' with img %}");
      String(twigContent).should.containEql("{% include 'atoms/images/img/img.twig' with img %}");
      options.convertCategoryTitles = true;
    })

  });

});
