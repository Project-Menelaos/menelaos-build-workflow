var gulp = require('gulp');
var shell = require('gulp-shell');
var mkdirp = require('mkdirp');
require('./common.js');

gulp.task('install-deps',
          shell.task(
              [
                [
                  'git',
                  'submodule',
                  'add',
                  'https://github.com/Project-Menelaos/c-flowchart',
                  './python_modules/c-flowchart'
                ].cmd(),
                [ 'git', 'submodule', 'update', '--init', '--recursive' ].cmd()
              ],
              {ignoreErrors : true, verbose : true}));

gulp.task(
    'update-deps',
    shell.task([ 'git', 'submodule', 'update', '--init', '--recursive' ].cmd(),
               {ignoreErrors : true, verbose : true}));

gulp.task('init', function() {
  // initialize environment
  gulp.start('display-logo');
  mkdirp('./python_modules');
  gulp.start('install-deps');
  structure = require('./doc/index.json');
  for (var heading in structure) {
    if (structure.hasOwnProperty(heading)) {
      folder = './doc/' + heading;
      console.log("Preparing folder: " + folder);
      mkdirp(folder);
      structure[heading].forEach(function(item) {
        file = folder + "/" + item + ".md";
        if (!fileExists(file)) {
          console.log("Creating file: " + file);
          savefile(file, "## " + item);
        }
      })
    }
  }
  console.log("Initialization finished.");
});
