//    __  __                 _
//   |  \/  | Project       | |
//   | \  / | ___ _ __   ___| | __ _  ___  ___
//   | |\/| |/ _ \ '_ \ / _ \ |/ _` |/ _ \/ __|
//   | |  | |  __/ | | |  __/ | (_| | (_) \__ \
//   |_|  |_|\___|_| |_|\___|_|\__,_|\___/|___/
//                             Fuck you, Helen!
//

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
var gfi = require("gulp-file-insert");
var order = require("gulp-order");

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
    structure = require('./doc/index.json');
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

gulp.task('build-src', function() {
    console.log("Building sources...");
    scriptsPath = './src'
    var folders = getFolders(scriptsPath);
    mkdirp(buildDir + '/src');

    var tasks = folders.map(function(folder) {
       // concat into foldername.md
       return gulp.src(path.join(scriptsPath, folder, '/**/*.{c,h}'))
       .pipe(insert.transform(function(contents, file) {
        	var head = '### 文件`' + file.path + '`的内容：\n```c\n';
            var tail = '\n```'
        	return head + contents + tail;
        }))
         .pipe(concat(buildDir + '/src/' + folder + '.md'))
         .pipe(gulp.dest('./'));
    });

    var root = gulp.src(buildDir + '/src/*.md')
         .pipe(concat('src.md'))
         .pipe(gulp.dest(buildDir));

    return merge(tasks , root);
})

gulp.task('build', ['update-deps', 'make-docx'], function () {
    console.log("Building project...");
})

gulp.task('build-doc', function () {
    console.log("Building documents...");
    docsPath = './src'
    structure = require('./doc/index.json');
    // console.log(structure);
    Object.keys(structure).map(function(folder, index) {
        console.log(folder);
        console.log(structure[folder]);
        structure[folder].map(function(item){
            return item + '.md'
        })
    });
    sequence = [];
    for (var items in structure) {
        if (structure.hasOwnProperty(items)) {
            for (var item in structure[items]) {
                if (items.hasOwnProperty(item)) {
                    sequence.push(path.join(docsPath, items, structure[items][item] + '.md'));
                }
            }
        }
    }
    // console.log(sequence);
    // gulp.src(path.join(docsPath, '/**/*.md'))
    //   .pipe(gfi({
    //     "/* file 1 */": "tmp/file1",
    //     "/* file 2 */": "tmp/file2",
    //     version: "tmp/version_number"
    //   }))
    //   .pipe(gulp.dest('./dist/'));
    //return merge(tasks);
    gulp.src(path.join(docsPath, '/**/*.md'))
        .pipe(order(sequence))
        .pipe(concat(buildDir + '/src/' + folder + '.md'))
        .pipe(gulp.dest(path.join(buildDir, 'docs')));
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
