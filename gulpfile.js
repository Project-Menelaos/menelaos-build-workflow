//    __  __                 _
//   |  \/  | Project       | |
//   | \  / | ___ _ __   ___| | __ _  ___  ___
//   | |\/| |/ _ \ '_ \ / _ \ |/ _` |/ _ \/ __|
//   | |  | |  __/ | | |  __/ | (_| | (_) \__ \
//   |_|  |_|\___|_| |_|\___|_|\__,_|\___/|___/
//                             Fuck you, Helen!
//

var art = "IF9fICBfXyAgICAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgICAgDQp8ICBcLyAgfCBQcm9qZWN0ICAgICAgIHwgfCAgICAgICAgICAgICAgICANCnwgXCAgLyB8IF9fXyBfIF9fICAgX19ffCB8IF9fIF8gIF9fXyAgX19fDQp8IHxcL3wgfC8gXyBcICdfIFwgLyBfIFwgfC8gX2AgfC8gXyBcLyBfX3wNCnwgfCAgfCB8ICBfXy8gfCB8IHwgIF9fLyB8IChffCB8IChfKSBcX18gXA0KfF98ICB8X3xcX19ffF98IHxffFxfX198X3xcX18sX3xcX19fL3xfX18vDQogICAgICAgICAgICAgICAgICAgICAgICAgRnVjayB5b3UsIEhlbGVuIQ==";
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
var marked = require('marked');
var file = require('gulp-file');
var walk = require('walk');
// var mermaid = require('mermaid');

var buildDir = './build'

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function savefile(filename, string) {
  fs.writeFileSync(filename, string);
}

gulp.task('display-logo', function() {
    console.log(new Buffer(art, 'base64').toString('ascii'));
})

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
    gulp.start('display-logo');
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
                    savefile(file, "## " + item);
                }
            })
        }
    }
    console.log("Initialization finished.");
})

gulp.task('build-src', function() {

})

gulp.task('build-src-graph', function() {
    mkdirp(path.join(buildDir, 'graph-src'));
    // TODO: change to walk.walk
        walk.walk(path.join('./', 'src'), {
            followLinks: false,
            filters: ["Temp", "_Temp", ".git*", ".git/", ".*\.xcodeproject$", "\.DS_Store"]
        }).on("file", function(root, fileStat, next) {
    //         fs.readFile(path.resolve(root, fileStat.name), function (buffer) {
    //     console.log(fileStat.name, buffer.byteLength);
    //     next();
    //   });
        filename = fileStat.name;
        filepath = path.resolve(root, filename)
            if (['.c'].contains(path.extname(filename))) {
                console.log("Found: " + filename);
                gulp.src(filepath, {read: false})
                    .pipe(shell([
                      '/usr/bin/env python3 ./python_modules/c-flowchart/mermaid_graph.py <%= file.path %> > ' + path.join(buildDir, 'graph-src', filename + '.graph'),
                  ], {
                      ignoreErrors: true
                  }))
            }
        next();
    })

})

gulp.task('build-graph', ['build-src-graph'], function() {
    mkdirp(path.join(buildDir, 'graph'));
    // mermaid.initialize({
    //       startOnLoad:true,
    //       flowchart:{
    //               useMaxWidth:true,
    //               htmlLabels:true
    //       }
    // });
    // TODO: change to walk.walk
    walk.walk(path.join(buildDir, 'graph-src'), {
        followLinks: false,
    }).on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename)
            if (['.graph'].contains(path.extname(filename))) {
                console.log("Mermaid parse: " + filename);
                fs.readFile(filepath, 'utf8', function (err,data) {
                  if (err) {
                    return console.log(err);
                  }
                //   console.log(data);
                //   mermaid.mermaidAPI.render('test', data, function(svgGraph){
                //     console.log(svgGraph);
                //     savefile(path.join(buildDir, 'graph', filename + '.svg', svgGraph));
                //  });
                });
            }
        next();
    });

    mdString = "";
    walk.walk(path.join(buildDir, 'graph'), {
        followLinks: false,
    }).on("file", function(root, fileStat, next) {
        filename = fileStat.name;
        filepath = path.resolve(root, filename)
            if (['.svg'].contains(path.extname(filename))) {
                console.log("Adding: " + filename);
                // fs.readFile(filepath, 'utf8', function (err,data) {
                //   if (err) {
                //     return console.log(err);
                //   }
                // //   console.log(data);
                // //   mermaid.mermaidAPI.render('test', data, function(svgGraph){
                // //     console.log(svgGraph);
                // //     savefile(path.join(buildDir, 'graph', filename + '.svg', svgGraph));
                // //  });
                // });
                mdString += "`" + filename + "`:\n" + "![" + filepath + "](" + " " + filename + ")" ;
            }
        next();
    }).on("end", function(){
        savefile(path.join(buildDir, 'graph.md'), mdString);
    })
})

gulp.task('build-src-list', function() {
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

gulp.task('build-doc', ['build-src-list', 'build-graph'], function () {
    console.log("Building documents...");
    docsPath = './doc'
    structure = require('./doc/index.json');

    Object.keys(structure).map(function(folder) {
       // concat into foldername.md
       sequence = structure[folder].map(function(i){return i + '.md'});
       gulp.src(path.join(docsPath, folder, '*.md'))
         .pipe(order(sequence))
         .pipe(concat(path.join(buildDir, 'doc', 'docs',folder + '.md')))
         .pipe(insert.transform(function(contents, file) {
         	return '# ' + folder + '\n' + contents;
         }))
         .pipe(gulp.dest('./'));
    });

    sequence = Object.keys(structure).map(function(i) {return i + '.md'});
    console.log(sequence);
    gulp.src(path.join(buildDir, 'doc', '**/*.md'))
        .pipe(order(sequence))
        .pipe(insert.transform(function(contents, file) {
           return contents + '\n';
        }))
        .pipe(concat('doc.md'))
        .pipe(gfi({
            "{{ src-list }}": path.join(buildDir, 'src.md'),
            "{{ src-graph }}": path.join(buildDir, 'graph.md'),
            // version: "gulpfile."
        }))
        .pipe(gulp.dest(path.join(buildDir)));
})

gulp.task('make-docx', ['build-doc', 'build-src'], shell.task([
  'pandoc --from=markdown_github --to=docx --smart --verbose --output="./build/report.docx" ./build/doc.md'
]))

gulp.task('package', ['build'], function () {
    console.log("Packaging project files...");
})

gulp.task('watch', function () {
    watch('./{doc,src}/**/*.*', function () {
        gulp.start('build', done);
    });
});
