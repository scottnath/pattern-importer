Pattern Importer
---

A node-based script for importing patterns, following the [Pattern Library](http://github.com/pattern-library/pattern-library) model.

**THIS IS POC CODE**

but...we can still make it work by following these steps for [Atlas](/scottnath/atlas):

1. Install Atlas using the yeoman generator
2. Add the pattern-importer as a node module:

```
npm install git+ssh://git@github.com:pattern-library/pattern-importer.git
```

3. Add the pattern-library as a bower dependency:

```
bower install git@github.com:pattern-library/pattern-library.git
```

4. Create a new gulp file `./app/_gulp/pattern-import.js`
5. Add the following code to `pattern-import.js`:

```
/**
 *  @fileOverview Uses Gulpjs to grab html patterns
 *
 *  @author       Scott Nath
 *
 *  @requires     NPM:gulp
 *  @requires     NPM:js-yaml
 *  @requires     /gulp/config.js
 */
'use strict';
var gulp = require('gulp'),
    print = require('gulp-print'),
    patternImporter = require('pattern-importer');

var pattFiles = ['./app/bower_components/pattern-library/patterns/**/pattern.yml'];

gulp.task('pattern-import', function() {
  console.log('-------------------------------------------------- DEVELOPMENT: GRABBING HTML PATTERNS');

  return gulp.src(pattFiles)
    .pipe(print())
    .pipe(patternImporter());
});
```

6. Import the patterns on the command line with:

```
gulp pattern-import
```

7. Find your imported patterns in ./app/_patterns
