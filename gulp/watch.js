var gulp = require('gulp');
var watch = require('gulp-watch');
var config = require('../config.json');

gulp.task('watch', function() {
  watch('./{doc,src}/**/*.*', function() { gulp.start('build', done); });
});
