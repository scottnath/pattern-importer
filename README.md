Pattern Importer
---

A node module for importing HTML patterns following the [Pattern Library](http://github.com/pattern-library/pattern-library) model.

`pattern-importer` takes a batch of pre-compiled templates (twig, swig, plain html, etc), with their supporting javascript files, and pre-compiled stylesheets (sass, less, plain css, etc)  and converts them to HTML, CSS, and Javascript. It also replaces {{dataPlaceholders}} with default data from the patterns, or your project's data set.

## Installation

Install `pattern-importer` in your project:

	`npm install pattern-importer`

## Usage

### General Usage

1. Add the pattern-library as a npm dependency:

    ```
    npm install pattern-library
    ```

2. Require the gulp task in your gulpfile.js (See the [complete Gulp task details](gulp/) first)

    `var importPatterns = require('pattern-importer').gulpImportPatterns(gulp,options);`

3. Trigger the gulp task

    `gulp patterns-import`

    
