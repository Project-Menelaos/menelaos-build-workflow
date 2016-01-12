var gulp = require('gulp');
var walk = require('walk');
var path = require('path');
var shell = require('gulp-shell');

gulp.task('build-llvm-ir', function() {
  mkdirp(path.join(buildDir, 'dot-src'));
  // TODO: change to walk.walk
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
        if ([ '.c' ].contains(path.extname(filename))) {
          gulp.src(filepath, {read : false})
              .pipe(shell(
                  [
                    buildCommandline([
                      'opt',
                      filename,
                      '-dot-cfg',
                      '-o ' + filename + '.ll'
                    ])
                  ],
                  {
                    ignoreErrors : true,
                    verbose : true,
                    cwd :
                        path.join(require('process').cwd(), buildDir, 'dot-src')
                  }))
        }
        next();
      })
});

gulp.task('build-dot-graph-source', function() {
  walk.walk(path.join(buildDir, 'dot-src'))
      .on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename);
        if ([ '.ll' ].contains(path.extname(filename))) {
          gulp.src(filepath, {read : false})
              .pipe(shell(
                  [
                    [ 'opt', filename, '-dot-cfg', '-o ' + filename + '.dot' ]
                        .cmd()
                  ],
                  {
                    ignoreErrors : true,
                    verbose : true,
                    cwd :
                        path.join(require('process').cwd(), buildDir, 'dot-src')
                  }))
        }
        next();
      })
});

gulp.task('build-dot-graph-png', function() {
  walk.walk(path.join(buildDir, 'dot-src'))
      .on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename);
        if ([ '.dot' ].contains(path.extname(filename))) {
          gulp.src(filepath, {read : false})
              .pipe(shell(
                  [
                    [
                      'graphviz',
                      '-T png',
                      '-o ' + filepath + '.png',
                      filepath
                    ].cmd()
                  ],
                  {
                    ignoreErrors : true,
                    verbose : true,
                    cwd :
                        path.join(require('process').cwd(), buildDir, 'dot-src')
                  }))
        }
        next();
      })
});
