'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    swig = require('swig'),
    yaml = require('js-yaml'),
    path = require('path'),
    fs = require('fs-extra'),
    mkdirp = require('mkdirp'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'pattern-importer',
    PATTERN_DEV_FOLDER = './app/_patterns/',
    patternList = [];


/**
 * Grabs patterns and adds them to PATTERN_DEV_FOLDER
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
        vars,
        patternSubDir = '';

    /*
    find all patterns using their pattern.yml data file
    */
    //if (options.patternFile)
    if (path.basename(paths.absolute) === 'pattern.yml') { // NATH: "pattern.yml" for file name should have the option of being something else

      // get metadata from pattern.yml file
      meta = yaml.safeLoad(fs.readFileSync(paths.relative, 'utf8'));
      console.log('meta');
      console.log(meta);
      // get the data variables (if there are any)
      vars = meta.variables || {};
      // make the pattern folder
      mkdirp.sync(PATTERN_DEV_FOLDER);

      // if there is a category, we'll put this pattern into that category
      if (meta.category) {
        patternSubDir = meta.category + '/';
        // add category to list of patterns array
        if (patternList[meta.category] === undefined) {
          patternList[meta.category] = [];
        }
        patternList[meta.category].push(path.join(meta.pattern));
        if (meta.subcategory) {
          patternSubDir = patternSubDir + meta.subcategory + '/';
        }
      } else {
        patternList['uncategorized'].push(path.join(meta.pattern));
      }

      mkdirp.sync(PATTERN_DEV_FOLDER + patternSubDir);

      if (meta.styles && fs.existsSync(path.join(paths.folder, meta.styles))) {
        mkdirp.sync(PATTERN_DEV_FOLDER + patternSubDir + 'styles/');
        var styles = readFile(path.join(paths.folder, meta.styles));
        fs.writeFile(path.join(PATTERN_DEV_FOLDER + patternSubDir + 'styles/', meta.styles), styles, function (err) {
          if (err) throw err;
          console.log('styles saved!');
        });
      }
      if (meta.script && fs.existsSync(path.join(paths.folder, meta.script))) {
        mkdirp.sync(PATTERN_DEV_FOLDER + patternSubDir + 'scripts/');
        var script = readFile(path.join(paths.folder, meta.script));
        fs.writeFile(path.join(PATTERN_DEV_FOLDER + patternSubDir + 'scripts/', meta.script), script, function (err) {
          if (err) throw err;
          console.log('script saved!');
        });
      }
      if (meta.pattern && fs.existsSync(path.join(paths.folder, meta.pattern))) {
        var pattern = readFile(path.join(paths.folder, meta.pattern));
        console.log('vars');
        console.log(vars);
        var tpl = swig.compileFile(path.join(paths.folder, meta.pattern));
        fs.writeFile(PATTERN_DEV_FOLDER + patternSubDir + meta.pattern, tpl(vars), function (err) {
          if (err) throw err;
          console.log('pattern saved!');
        });
      }

      // console.log('patternList');
      // console.log(patternList);

      // Tell the user that stuff's gone down.
      gutil.log('Pattern ' + gutil.colors.magenta(paths.inner) + ' compiled');
    }    
    this.push(file);
    cb();
  });

  return stream;
}
