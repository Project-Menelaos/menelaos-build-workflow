//    __  __                 _
//   |  \/  | Project       | |
//   | \  / | ___ _ __   ___| | __ _  ___  ___
//   | |\/| |/ _ \ '_ \ / _ \ |/ _` |/ _ \/ __|
//   | |  | |  __/ | | |  __/ | (_| | (_) \__ \
//   |_|  |_|\___|_| |_|\___|_|\__,_|\___/|___/
//                             Fuck you, Helen!
//

var art =
    "IF9fICBfXyAgICAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgICAgDQp8ICBcLyAgfCBQc \
    m9qZWN0ICAgICAgIHwgfCAgICAgICAgICAgICAgICANCnwgXCAgLyB8IF9fXyBfIF9fICAgX19 \
    ffCB8IF9fIF8gIF9fXyAgX19fDQp8IHxcL3wgfC8gXyBcICdfIFwgLyBfIFwgfC8gX2AgfC8gX \
    yBcLyBfX3wNCnwgfCAgfCB8ICBfXy8gfCB8IHwgIF9fLyB8IChffCB8IChfKSBcX18gXA0KfF9 \
    8ICB8X3xcX19ffF98IHxffFxfX198X3xcX18sX3xcX19fL3xfX18vDQogICAgICAgICAgICAgI \
    CAgICAgICAgICAgRnVjayB5b3UsIEhlbGVuIQ==";
var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
require('require-dir')('./gulp');

var rename = require('gulp-rename');

var marked = require('marked');
var file = require('gulp-file');
// var mermaid = require('mermaid');

console.log(new Buffer(art, 'base64').toString('ascii'));

gulp.task('default', function() {
  gulp.start('build');
  gulp.start('watch');
});

gulp.task('graph',
          gulpSequence('llvm-ir',
                       [ 'cfg-dot', 'callgraph-dot', 'dom-dot', 'pydot-src' ],
                       'compile-dot', 'compile-graph'));

gulp.task('build', gulpSequence('update-deps', [ 'src-list', 'graph' ],
                                'markdown', 'docx'));
