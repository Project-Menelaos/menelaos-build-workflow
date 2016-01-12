var gulp = require('gulp');
var watch = require('gulp-watch');

gulp.task('watch', function() {
  watch('./{doc,src}/**/*.*', function() { gulp.start('build', done); });
});
