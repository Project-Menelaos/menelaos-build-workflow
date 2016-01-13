var gulp = require('gulp');
var shell = require('gulp-shell');
var path = require('path');
var mkdirp = require('mkdirp');
var order = require("gulp-order");
var concat = require('gulp-concat');
var gfi = require("gulp-file-insert");
var insert = require('gulp-insert');
var addsrc = require('gulp-add-src');
var config = require('../config.json');
var structure = require('../doc/index.json');

gulp.task('markdown', function() {
  docsPath = './doc';

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
  sequence.unshift("frontpage.md");
  console.log(sequence);
  gulp.src(path.join('doc', 'frontpage.md'))
      .pipe(addsrc(path.join(buildDir, 'doc', 'docs', '*.md')))
      .pipe(order(sequence))
      .pipe(insert.transform(function(contents, file) {
        return contents + '\n';
      }))
      .pipe(concat('report.md'))
      .pipe(gfi({
        "{{ src-list }}" : path.join(buildDir, 'src.md'),
        // "{{ src-graph }}" : path.join(buildDir, 'graph', 'graph.md'),
        "{{ callgraph }}" : path.join(buildDir, 'dot-src', 'callgraph.md'),
        "{{ cfg }}" : path.join(buildDir, 'dot-src', 'cfg.md'),
        "{{ dom }}" : path.join(buildDir, 'dot-src', 'dom.md'),
        "{{ py-cfg }}" : path.join(buildDir, 'dot-src', 'pydot.md'),
        "{{ data-structure }}" : path.join(buildDir, 'data-structure.c')
        // version: "gulpfile."
      }))
      .pipe(gulp.dest(path.join(buildDir)));
});

gulp.task('docx', shell.task(
                      [
                        [ 'rm', '-f', path.join(buildDir, 'report.docx') ]
                            .cmd(),
                        [
                          'pandoc',
                          '--from=markdown_github',
                          '--to=docx',
                          '--smart',
                          '--verbose',
                          '--output=' + path.join(buildDir, 'report.docx'),
                          path.join(buildDir, 'report.md')
                        ].cmd()
                      ],
                      {
                        ignoreErrors : true,
                        verbose : true,
                      }));
