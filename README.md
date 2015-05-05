Pattern Importer
---

A node module for importing HTML patterns following the [Pattern Library](http://github.com/pattern-library/pattern-library) model.

`pattern-importer` takes a batch of pre-compiled templates (twig, swig, plain html, etc), with their supporting javascript files, and pre-compiled stylesheets (sass, less, plain css, etc)  and converts them to HTML, CSS, and Javascript. It also replaces {{dataPlaceholders}} with default data from the patterns, or your project's data set.

## Installation

Install `pattern-importer` in your project:

	`npm install pattern-importer`

## Usage

### General Usage

1. Add the pattern-library as a bower dependency:

    ```
    bower install git@github.com:pattern-library/pattern-library.git
    ```

2. Require the gulp task in your gulpfile.js (See the [complete Gulp task details](gulp/) first)

    `var importPatterns = require('pattern-importer').gulpImportPatterns(gulp,options);`

3. Trigger the gulp task

    `gulp patterns-import`

### Use in the [Atlas development environment](http://scottnath.github.io/atlas)

1. Install Atlas using the [yeoman generator](https://github.com/scottnath/generator-atlas)
2. Add the Pattern Library to your project via Bower

    ```
    bower install git@github.com:pattern-library/pattern-library.git
    ```

3. Install the Pattern Importer

    `npm install pattern-importer --save`

4. Create a folder for your local patterns

    `mkdir ./app/patterns-local`

5. Add the included gulp task in `./app/_gulp/config-overrides.js`

    ```
    ...

    /*********************************************
    * Global settings override
    * either override individual settings or the entire object
    */
    var config = require('../../gulp/config');

    var options = {
      patternFiles: ['./app/bower_components/pattern-library/patterns/**/pattern.yml','./app/patterns-local/**/pattern.yml']
    }
    var importPatterns = require('pattern-importer').gulpImportPatterns(require('gulp'),options);

    ...
    ```

6. Run the gulp task to compile all the patterns

    `gulp patterns-import`
    
