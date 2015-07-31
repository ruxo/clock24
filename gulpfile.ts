/// <reference path="typings/gulp/gulp.d.ts" />
/// <reference path="typings/browser-sync/browser-sync.d.ts" />

import gulp = require('gulp');
import browserSync = require('browser-sync');

let browser = browserSync.create();

gulp.task('browser', () => {
  browser.init({
    server: {
       baseDir: "./",
       index: "clock24.html"
      }
    });
  });

gulp.task('watch', () => {
  gulp.watch(["*.js", "*.html"]).on('change', browser.reload);
  });

gulp.task('default', ['browser', 'watch']);
