var gulp = require('gulp');
var shell = require('gulp-shell');
var mkdirp = require('mkdirp');
var fileExists = require('file-exists');
require('./common.js');
var config = require('../config.json');
var structure = require('../doc/index.json');

gulp.task('install-deps', function() {
  mkdirp('./python_modules');
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
      {ignoreErrors : true, verbose : true});
});

gulp.task('update-deps', function() {
  shell.task(
      [
        [ 'git', 'submodule', 'update', '--init', '--recursive' ]
            .cmd(),
        [ 'ncu', '-u' ].cmd()
      ],
      {ignoreErrors : true, verbose : true});
});

gulp.task('init', [ 'install-deps', 'update-deps' ], function() {
  savefile(path.join('./doc', 'frontpage.md'), "# 标题");
  for (var heading in structure) {
    if (structure.hasOwnProperty(heading)) {
      folder = path.join('./doc', heading);
      console.log("Preparing folder: " + folder);
      mkdirp(folder);
      structure[heading].forEach(function(item) {
        file = path.join(folder, item + ".md");
        if (!fileExists(file)) {
          console.log("Creating file: " + file);
          savefile(file, "## " + item);
        }
      })
    }
  }
  console.log("Initialization finished.");
});
