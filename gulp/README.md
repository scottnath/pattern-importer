Pattern Importer Gulp Tasks
---

Contains [Gulp](http://gulpjs.com) tasks which can be used to perform functions for the pattern importer.

## Basic Usage

```
// gulpfile.js
var someTaskName = require('pattern-importer').gulpSomeTaskName(optionsObject);
```

---

## Gulp Task: `patterns-import`

Gulp task which imports and compilies patterns from any user-defined source.

### Usage

#### In your `gulpfile.js`, in the **requires** section:
```
var gulp = require('gulp');
var options = {
	patternFiles: ['./app/bower_components/pattern-library/patterns/**/pattern.yml','./app/patterns-local/**/pattern.yml']
}

var importPatterns = require('pattern-importer').gulpImportPatterns(gulp,options);
```

#### on the command line

`gulp patterns-import`

### Options

#### patternFiles

`{Array}` project-relative path to sets of un-compiled patterns, including package-manager-imported patterns

#### patternImporterOptions

see options for the [pattern-importer](https://github.com/scottnath/pattern-importer)
