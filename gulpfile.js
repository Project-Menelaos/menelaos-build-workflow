var gulp = require('gulp');
var watch = require('gulp-watch');
var shell = require('gulp-shell');
var mkdirp = require('mkdirp');

function savefile(filename, string) {
  require('fs').writeFileSync(filename, string);
}

gulp.task('default', function() {
  // compile
});

gulp.task('init', function() {
    // initialize environment
    var structure = require('./doc/index.json');
    for (var heading in structure) {
        if (structure.hasOwnProperty(heading)) {
            folder = './doc/' + heading;
            console.log("Creating folder: " + folder)
            mkdirp(folder);
            structure[heading].forEach(function(item){
                file = folder + "/" + item + ".md";
                console.log("Creating file: " + file);
                savefile(file, "# " + item);
            })
        }
    }
    console.log("Initialization finished.");
})

gulp.task('build', ['make-docx'], function () {
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

gulp.task('watch', function () {
    watch('./{doc,src}/**/*.*', function () {
        gulp.start('build', done);
    });
});
