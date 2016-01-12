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

getFiles = function(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isFile();
  });
};

gulp.task('compile-graph', function() {
  scriptsPath = './build/dot-src';
  var folders = getFolders(scriptsPath);
  folders.forEach(function(folder) {
    mdString = "";
    console.log(path.join(scriptsPath, folder));
    files = getFiles(path.join(scriptsPath, folder));
    for (var i in files) {
      filename = files[i];
      if ([ '.png' ].contains(path.extname(filename))) {
        console.log(filename);
        filepath = path.resolve(path.join(scriptsPath, folder), filename);
        title = filename.replace(".dot.png", '');
        mdString += mkimage(filepath, title);
      }
    }

    savefile(path.join(scriptsPath, folder + ".md"), mdString);

  });
});
