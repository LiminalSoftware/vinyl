var gulp   = require('gulp')
  , copy   = require('gulp-copy')
  , rev    = require('gulp-rev')
  , usemin = require('gulp-usemin')
  ;

gulp.task('copy', function () {
  return gulp.src('./assets/**/*')
    .pipe(copy('./dist/assets/'))
    ;
});

gulp.task('usemin', function () {
  return gulp.src('./src/index.html')
    .pipe(usemin({
      css: [rev()],
      js : [rev()]
    }))
    .pipe(gulp.dest('./dist/'))
    ;
});
