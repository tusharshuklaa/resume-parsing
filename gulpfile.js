const { 
  parallel,
  src,
  dest
} = require('gulp'),
sass = require('gulp-sass');
sass.compiler = require('node-sass');

const sassify = function() {
  return src('src/scss/base.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('css'));
},
copyJs = function() {
  return src('src/js/main.js')
    .pipe(dest('js'));
};


exports.default = parallel(sassify, copyJs);
