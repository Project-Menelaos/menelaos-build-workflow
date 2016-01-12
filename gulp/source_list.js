var gulp = require('gulp');
var mkdirp = require('mkdirp');
var path = require('path');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var config = require('../config.json');

gulp.task('src-list', function() {
  scriptsPath = './src';
  var folders = getFolders(scriptsPath);
  mkdirp(buildDir + '/src');

  var tasks = folders.map(function(folder) {
    // concat into foldername.md
    return gulp.src(path.join(scriptsPath, folder, '/**/*.{c,h}'))
        .pipe(insert.transform(function(contents, file) {
          var head = '### 文件`' + file.path + '`的内容：\n```c\n';
          var tail = '\n```';
          return head + contents + tail;
        }))
        .pipe(concat(buildDir + '/src/' + folder + '.md'))
        .pipe(gulp.dest('./'));
  });

  var root = gulp.src(buildDir + '/src/*.md')
                 .pipe(concat('src.md'))
                 .pipe(gulp.dest(buildDir));

  return merge(tasks, root);
});
