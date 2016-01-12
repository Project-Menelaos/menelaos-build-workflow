var gulp = require('gulp');
var walk = require('walk');
var path = require('path');
var shell = require('gulp-shell');
var mkdirp = require('mkdirp');
var fs = require('fs');
var config = require('../config.json');
var buildDir = "./build";

gulp.task('llvm-ir', function() {
  mkdirp(path.join(buildDir, 'dot-src'));
  // TODO: change to walk.walk
  walk.walk(path.join('./', 'src'), {followLinks : false})
      .on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename);
        if ([ '.c' ].contains(path.extname(filename))) {
          gulp.src(filepath, {read : false})
              .pipe(shell(
                  [
                    [
                      'clang',
                      '-S',
                      '-emit-llvm',
                      '-o ' + filename + '.ll',
                      filepath
                    ].cmd()
                  ],
                  {
                    ignoreErrors : false,
                    verbose : true,
                    cwd :
                        path.join(require('process').cwd(), buildDir, 'dot-src')
                  }))
        }
        next();
      })
});

gulp.task('compile-dot', function() {
  scriptsPath = path.join(buildDir, 'dot-src');
  mkdirp(scriptsPath);
  var folders = getFolders(scriptsPath);
  folders.map(function(folder) {
    walk.walk(path.join(buildDir, 'dot-src', folder))
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
                      cwd : path.join(require('process').cwd(), buildDir,
                                      'dot-src', folder)
                    }))
          }
          next();
        })
  })
});

var mkimage = function(path, title) {
  return "### " + title + "\n" + "![" + title + "](" + path + ")\n";
};

var savefile = function(filename, string) {
  fs.writeFileSync(filename, string);
};

gulp.task('compile-graph', function() {
  scriptsPath = './build/dot-src';
  var folders = getFolders(scriptsPath);
  folders.map(function(folder) {
    mdString = "";
    walk.walk(path.join(scriptsPath, folder))
        .on("file",
            function(root, fileStat, next) {
              filename = fileStat.name;
              console.log(filename);
              if ([ '.png' ].contains(path.extname(filename))) {
                filepath = path.resolve(root, filename);
                title = filename.replace(".dot.png", '');
                mdString += mkimage(filepath, title);
              }
              next();
            })
        .on('end', function() {
          savefile(path.join(scriptsPath, folder + ".md"), mdString);
        });
  });
});
