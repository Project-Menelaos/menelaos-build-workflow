var gulp = require('gulp');
var mkdirp = require('mkdirp');
var walk = require('walk');
var path = require('path');
var shell = require('gulp-shell');
require('./common.js');

gulp.task('pydot-src', function() {
  mkdirp(path.join(buildDir, 'dot-src', 'pydot'));
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
          console.log("Found: " + filename);
          gulp.src(filepath, {read : false})
              .pipe(shell(
                  [
                    '/usr/bin/env python3 ./python_modules/c-flowchart/dot_graph.py <%= file.path %> > ' +
                        path.join(buildDir, 'dot-src', 'pydot',
                                  filename + '.dot'),
                  ],
                  {ignoreErrors : true, verbose : true}))
        }
        next();
      })
});

gulp.task('pydot-graph', [ 'mermaid-src' ], function() {
  mkdirp(path.join(buildDir, 'graph'));
  walk.walk(path.join(buildDir, 'graph-src'), {followLinks : false})
      .on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename);
        if ([ '.graph' ].contains(path.extname(filename))) {
          console.log("Found mermaid source file: '" + filename +
                      "', but svg auto generation is not supported.");
          //   fs.readFile(filepath, 'utf8', function(err, data) {
          //     if (err) {
          //       return console.log(err);
          //     }
          //   });
        }
        next();
      });

  // mdString = "";
  // walk.walk(path.join(buildDir, 'graph'),
  //           {
  //             followLinks : false,
  //           })
  //     .on("file",
  //         function(root, fileStat, next) {
  //           filename = fileStat.name;
  //           filepath = path.resolve(root, filename);
  //           if ([ '.svg' ].contains(path.extname(filename))) {
  //             console.log("Adding: " + filename);
  //             mdString += "`" + filename + "`:\n" + "![" + filename + "](" +
  //                         " " + filename + ")";
  //           }
  //           next();
  //         })
  //     .on("end", function() {
  //       savefile(path.join(buildDir, 'graph', 'graph.md'), mdString);
  //     })
});
