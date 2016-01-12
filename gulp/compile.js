var gulp = require('gulp');
var shell = require('gulp-shell');
var path = require('path');

gulp.task('build', [ 'update-deps', 'make-docx' ],
          function() { console.log("Building project..."); });

gulp.task('build-doc', [ 'build-src-list', 'build-graph' ], function() {
  console.log("Building documents...");
  docsPath = './doc';
  structure = require('./doc/index.json');

  Object.keys(structure).map(function(folder) {
    // concat into foldername.md
    sequence = structure[folder].map(function(i) { return i + '.md' });
    gulp.src(path.join(docsPath, folder, '*.md'))
        .pipe(order(sequence))
        .pipe(concat(path.join(buildDir, 'doc', 'docs', folder + '.md')))
        .pipe(insert.transform(function(contents, file) {
          return '# ' + folder + '\n' + contents;
        }))
        .pipe(gulp.dest('./'));
  });

  sequence = Object.keys(structure).map(function(i) { return i + '.md' });
  console.log(sequence);
  gulp.src(path.join(buildDir, 'doc', '**/*.md'))
      .pipe(order(sequence))
      .pipe(insert.transform(function(contents, file) {
        return contents + '\n';
      }))
      .pipe(concat('doc.md'))
      .pipe(gfi({
        "{{ src-list }}" : path.join(buildDir, 'src.md'),
        "{{ src-graph }}" : path.join(buildDir, 'graph', 'graph.md'),
        // version: "gulpfile."
      }))
      .pipe(gulp.dest(path.join(buildDir)));
});

gulp.task('make-docx', [ 'build-doc', 'build-src' ], shell.task([
  [
    'pandoc',
    '--from=markdown_github',
    '--to=docx',
    '--smart',
    '--verbose',
    '--output="./build/report.docx"',
    './build/doc.md'
  ].cmd()
]));
