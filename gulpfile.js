var gulp = require('gulp');
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
})
