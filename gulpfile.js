var gulp = require('gulp');
var watch = require('gulp-watch');
var shell = require('gulp-shell');
var mkdirp = require('mkdirp');
var fileExists = require('file-exists');
var fs = require('fs');
var path = require('path');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var insert = require('gulp-insert');

var buildDir = './build'

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function savefile(filename, string) {
  require('fs').writeFileSync(filename, string);
}

gulp.task('default', function() {
  gulp.start('build', done);
  gulp.start('watch', done);
});

gulp.task('install-deps', shell.task([
  'git submodule add https://github.com/Project-Menelaos/c-flowchart ./python_modules/c-flowchart || true',
  'git submodule update --init --recursive'
]))

gulp.task('update-deps', shell.task([
    'git submodule update --init --recursive'
]))

gulp.task('init', function() {
    // initialize environment
    mkdirp('./python_modules');
    gulp.start('install-deps');
    var structure = require('./doc/index.json');
    for (var heading in structure) {
        if (structure.hasOwnProperty(heading)) {
            folder = './doc/' + heading;
            console.log("Preparing folder: " + folder)
            mkdirp(folder);
            structure[heading].forEach(function(item){
                file = folder + "/" + item + ".md";
                if (!fileExists(file)) {
                    console.log("Creating file: " + file);
                    savefile(file, "# " + item);
                }
            })
        }
    }
    console.log("Initialization finished.");
})

gulp.task('source-code-list', function() {
    console.log("Building source list...");
    scriptsPath = './src'
    var folders = getFolders(scriptsPath);
    mkdirp(buildDir + '/src');

    var tasks = folders.map(function(folder) {
       // concat into foldername.js
       // write to output
       // minify
       // rename to folder.min.js
       // write to output again
       return gulp.src(path.join(scriptsPath, folder, '/**/*.{c,h}'))
       .pipe(insert.transform(function(contents, file) {
        	var head = '### 文件`' + file.path + '`的内容：\n```c\n';
            var tail = '\n```'
        	return head + contents + tail;
        }))
         .pipe(concat(buildDir + '/src/' + folder + '.md'))
         .pipe(gulp.dest('./'));
    });

    // process all remaining files in scriptsPath root into main.js and main.min.js files
    // var root = gulp.src(path.join(scriptsPath, '/*.js'))
    //      .pipe(concat('main.js'))
    //      .pipe(gulp.dest(scriptsPath))
    //      .pipe(rename('main.min.js'))
    //      .pipe(gulp.dest(scriptsPath));

    return merge(tasks);// , root);
})

gulp.task('build', ['update-deps', 'make-docx'], function () {
    console.log("Building project...");
})

gulp.task('build-doc', function () {
    console.log("Building documents...");
})

gulp.task('build-src', function () {
    console.log("Building sources...");
})

gulp.task('collect-doc', ['build-doc', 'build-src'], function () {
    console.log("Collecting documents...");
})

gulp.task('make-docx', ['collect-doc'], function () {
    console.log("Making Microsoft Word format output...");
})

gulp.task('package', ['build'], function () {
    console.log("Packaging project files...");
})

gulp.task('watch', function () {
    watch('./{doc,src}/**/*.*', function () {
        gulp.start('build', done);
    });
});
