var gulp = require('gulp');
var mkdirp = require('mkdirp');
var walk = require('walk');
var path = require('path');
var shell = require('gulp-shell');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
require('./common.js');

gulp.task('data-structure-src', function() {
  // mkdirp(path.join(buildDir, 'data-structure'));
  walk.walk(path.join('./', 'src'),
            {
              followLinks : false,
              filters : [
                "Temp",
                "_Temp",
                ".git*",
                ".git/",
                ".*\.xcodeproject$",
                "\.DS_Store"
              ]
            })
      .on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename);
        if ([ '.c', '.h' ].contains(path.extname(filename))) {
          console.log("Found: " + filename);
          gulp.src(filepath, {read : false})
              .pipe(shell(
                  [

                    [
                      '/usr/bin/env',
                      'python3',
                      './python_modules/c-flowchart/cstruct_generator.py',
                      '<%= file.path %>',
                      '>> ' + path.join(buildDir, 'data-structure.c')
                    ].cmd()

                  ],
                  {ignoreErrors : true, verbose : true}))
        }
        next();
      });
});

gulp.task('data-structure', function() {
  gulp.src(path.join(buildDir, 'data_structure.c'))
      .pipe(insert.transform(function(contents, file) {
        return '```\n' + contents + '```\n';
      }))
      .pipe(concat('data_structure.md'))
      .pipe(gulp.dest(path.join(buildDir)));
});
