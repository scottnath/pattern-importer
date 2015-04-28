'use strict';
var twig = require('twig');


var twigCompiler = function compile (src, data) {
  var tpl = twig.twig({
    path: src,
    async: false
  }); //read the file with Twig
  return tpl.render(data);
}

module.exports = twigCompiler;
