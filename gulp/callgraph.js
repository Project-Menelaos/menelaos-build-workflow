var gulp = require('gulp');
var walk = require('walk');
var path = require('path');
var shell = require('gulp-shell');
var mkdirp = require('mkdirp');
var config = require('../config.json');
var buildDir = "./build";

gulp.task('callgraph-dot', function() {
  mkdirp(path.join(buildDir, 'dot-src', 'callgraph'))
      walk.walk(path.join(buildDir, 'dot-src'))
          .on("file", function(root, fileStat, next) {
            filename = fileStat.name;
            filepath = path.resolve(root, filename);
            if ([ '.ll' ].contains(path.extname(filename))) {
              gulp.src(filepath, {read : false})
                  .pipe(shell(
                      [
                        [
                          'opt',
                          filepath,
                          '-dot-callgraph',
                          '-o ' + filename + '.dot'
                        ].cmd()
                      ],
                      {
                        ignoreErrors : true,
                        verbose : true,
                        cwd : path.join(require('process').cwd(), buildDir,
                                        'dot-src', 'callgraph')
                      }))
            }
            next();
          })
});
