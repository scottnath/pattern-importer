'use strict';

/*

THIS IS BETA CODE

code below works, but is a POC and not finalized or optimized in any way

*/

var through = require('through2'),
    gutil = require('gulp-util'),
    twig = require('twig'),
    yaml = require('js-yaml'),
    path = require('path'),
    fs = require('fs-extra'),
    mkdirp = require('mkdirp'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer',
    PATTERN_IMPORT_DEST = './app/_patterns/',
    patternList = [];

    var sass = require('node-sass');


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
    inner: file.path.replace(process.cwd() + '/', '').split('/').slice(1, -1).join('/')
  };
  return paths;
}

/**
 * Reads of file and provides error-logging of file read errors
 * @function readFile
 *
 */
var readFile = function readFile (file) {
  try {
    var file = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.log(err.message);
    return;
  }
  return file;
}

/**
 * Grabs patterns and adds them to PATTERN_IMPORT_DEST
 * @function
 *
 */
module.exports = function (options) {
  options = options || {};

  var stream = through.obj(function (file, encoding, cb) {

    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported'));
      return cb();
    }

    var paths = getFilePaths(file);
    var pattern,
        meta,
        data,
        patternCatDir = '',
        patternDestDir,
        configYml = {};

    console.log('path.dirname(paths.absolute)');
    console.log(path.dirname(paths.absolute));
    var pathElements = path.dirname(paths.absolute).replace(/\/$/, '').split('/');
    var patternDirName = pathElements[pathElements.length - 1];
    console.log(paths.folder);
    console.log(patternDirName);
    /*
    find all patterns using their pattern.yml data file
    */
    //if (options.patternFile)
    if (path.basename(paths.absolute) === 'pattern.yml') { // NATH: "pattern.yml" for file name should have the option of being something else

      // get metadata from pattern.yml file
      meta = yaml.safeLoad(fs.readFileSync(paths.relative, 'utf8'));
      console.log(meta);
      // get the data variables (if there are any)
      data = meta.data || {};

      // make the pattern folder
      mkdirp.sync(PATTERN_IMPORT_DEST);

      // start putting pattern data into configYml object
      configYml.name = meta.name;

      // if there is a description, we'll add that to the configYml object
      if (meta.includes) {
        configYml.includes = meta.includes
      }

      // source will be the location of the pattern in this project
      configYml.source = paths.folder;

      // source of the DATA used - NATH: this section will change with addition of func to add LIVE/LOCAL data
      configYml.data = 'source';

      // if there is a description, we'll add that to the configYml object
      if (meta.description) {
        configYml.description = meta.description
      }

      // if there is a category, we'll put this pattern into that category's subfolder
      if (meta.category) {

        // add category to configYml
        configYml.category = meta.category

        patternCatDir = meta.category + '/';
        // add category to list of patterns array:: NATH: this may be not needed. why do you have this object?
        if (patternList[meta.category] === undefined) {
          patternList[meta.category] = [];
        }
        patternList[meta.category].push(path.join(meta.html));

      } else {
        patternList['uncategorized'].push(path.join(meta.html));
      }

      patternDestDir = PATTERN_IMPORT_DEST + patternCatDir + patternDirName;
      console.log(patternDestDir);
      mkdirp.sync(patternDestDir);
      //console.log(patternDestDir.isDirectory());
      if (meta.sass) {

        var stats = fs.statSync(path.join(paths.folder, meta.sass));
        if (stats.isDirectory()) {
          // allow a whole directory to be dumped
          console.log('SASS is A DIR');
          fs.copy(path.join(paths.folder, meta.sass), patternDestDir + '/sass', function(err) {
            if (err) return console.error(err)
            console.log("success! (sass dir)")
          }) //copies directory
        } else {
          //otherwise, finds the containing dir of the file
          console.log('SASS is A FILE');
          var cssFileName = patternDirName + '.css';

          // THIS SECTION IS TO COPY THE SASS DIRECTORY
          // var origSassDir = path.dirname(path.join(paths.folder, meta.sass));
          // fs.copy(origSassDir, patternDestDir + '/sass', function(err) {
          //   if (err) return console.error(err)
          //   console.log("success! (sass file)");
          // }) //copies file
          // console.log('ACKACK');
          // console.log('./'+path.join(patternDestDir, patternDirName + '.css'));

          // add css to configYml
          configYml.css = cssFileName;

          var result = sass.renderSync({
            file: path.join(paths.folder, meta.sass)
          });

          fs.writeFile(path.join(patternDestDir, cssFileName), result.css.toString().trim(), function (err) {
            if (err) throw err;
            console.log('css file saved ('+path.join(patternDestDir, cssFileName)+')');
          });

        }
      }
      if (meta.script && fs.existsSync(path.join(paths.folder, meta.script))) {

        // add script to configYml
        configYml.script = meta.script

        //mkdirp.sync(PATTERN_IMPORT_DEST + patternCatDir + 'scripts/');
        var script = readFile(path.join(paths.folder, meta.script));
        fs.writeFile(path.join(patternDestDir, meta.script), script, function (err) {
          if (err) throw err;
          console.log('script saved!');
        });
      }
      if (meta.html && fs.existsSync(path.join(paths.folder, meta.html))) {

        // add html file to configYml
        configYml.html = meta.html

        var pattern = readFile(path.join(paths.folder, meta.html));
        console.log('data');
        console.log(data);

        var tpl = twig.twig({
          path: path.join(paths.folder, meta.html),
          async: false
        }); //read the file with Twig
        console.log(tpl.render(data));

        fs.writeFile(path.join(patternDestDir, meta.html), tpl.render(data), function (err) {
          if (err) throw err;
          console.log('pattern saved!');
        });

        // var tpl = swig.compileFile(path.join(paths.folder, meta.html));
        // fs.writeFile(path.join(patternDestDir, meta.html), tpl(data), function (err) {
        //   if (err) throw err;
        //   console.log('pattern saved!');
        // });
      }
      console.log('configYml');
      console.log(configYml);
      /*
      source: bower_components/pattern-library/patterns/figure-image
      data: source, [name of data source]
      includes:
        - base/img
        - components/message
      */
      // configYml.source = 'test';
      // configYml.data = 'source';
      fs.writeFile(path.join(patternDestDir, 'compiled.yml'), yaml.safeDump(configYml), function (err) {
        if (err) throw err;
        console.log('compiled.yml saved!');
      });

      // Tell the user that stuff's gone down.
      gutil.log('Pattern ' + gutil.colors.magenta(paths.inner) + ' compiled');
    }
    this.push(file);
    cb();
  });

  return stream;
}
