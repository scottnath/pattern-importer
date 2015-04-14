// 'use strict';
// var fsp = require('fs-promise'),
//     path = require('path'),
//     twig = require('twig');


// var compile = function compile (src, dest, data) {
//   console.log('src');
//   console.log(src);
//   console.log('dest');
//   console.log(dest);
//   console.log('data');
//   console.log(data);
//   var tpl = twig.twig({
//     path: src,
//     async: false
//   }); //read the file with Twig
//   fsp.writeFile(dest, tpl.render(data))
//     .then(function(){
//       console.log(path.basename(dest) + ' template rendered');
//     });
// }

// module.exports = {
//   compile: compile
// };
