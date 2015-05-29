'use strict';
var twig = require('twig');

/**
 * Compiles twig templates into html
 *
 * @param {String}  src  twig template
 * @param {Object}  data  object of template-matching data
 *
 * @return {String}  compiled html
 */
var twigCompiler = function compile (src, data) {
  var tpl = twig.twig({
    path: src,
    async: false
  }); //read the file with Twig
  return tpl.render(data);
}

module.exports = twigCompiler;
