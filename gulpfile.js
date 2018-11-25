// Requiring modules
const {
  parallel,
  series,
  src,
  dest,
  watch
} = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  // rename = require("gulp-rename"),
  uglify = require('gulp-uglify'),
  pump = require('pump'),
  scssUrl = "src/scss",
  vendorCss = "src/vendor/css",
  vendorJs = "src/vendor/js",
  jsUrl = "src/js",
  destCss = "dest/assets/css",
  destJs = "dest/assets/js",
  srcFonts = "src/vendor/fonts",
  destFonts = "dest/assets/fonts";

  // Gulp Tasks
const handleVendorCss = function(cb) {
  pump([
      src([vendorCss + '/bootstrap.min.css', vendorCss + '/font-awesome.min.css']),
      sourcemaps.init(),
      concat({
        path: 'vendor.min.css'
      }),
      sourcemaps.write(),
      dest(destCss)
    ],
    cb
  );
},
sassify = function (cb) {
  pump([
    src(scssUrl + '/base.scss'),
    sass().on('error', sass.logError),
    dest(destCss)
  ], cb);
},
watchSass = function () {
  return watch(scssUrl + '/**/*.scss', series(sassify));
},
watchJs = function () {
  return watch(jsUrl + '/**/*.js', series(copyJs));
},
handleVendorJs = function(cb) {
  pump([
    src([vendorJs + '/jquery.min.js', vendorJs + '/bootstrap.min.js']),
    sourcemaps.init(),
    concat({
      path: 'vendor.min.js'
    }),
    uglify(),
    sourcemaps.write(),
    dest(destJs)
  ], cb);
},
copyJs = function (cb) {
  pump([
    src(jsUrl + '/main.js'),
    dest(destJs)
  ], cb);
},
copyFonts = function (cb) {
  pump([
    src(srcFonts + '/**/*.*'),
    dest(destFonts)
  ], cb);
},
handleAll = parallel(handleVendorCss, sassify, handleVendorJs, copyJs, copyFonts);

// Default build task
exports.default = series(handleAll, parallel(watchSass, watchJs));
