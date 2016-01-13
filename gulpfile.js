var gulp           = require('gulp')
  , merge          = require('merge-stream')
  , rev            = require('gulp-rev')
  , del            = require('del')
  , revReplace     = require('gulp-rev-replace')
  , gzip           = require('gulp-gzip')
  , s3             = require('gulp-s3')
  , fs             = require('fs')
  , awsCredentials = JSON.parse(fs.readFileSync('./.aws.json'))
  ;

gulp.task('clean', function () {
  return del('./dist/')
});

gulp.task('rev', ['clean'], function () {
  var scripts = gulp.src('./build/bundle.js')
    .pipe(rev())
    .pipe(gulp.dest('./dist/'))
    .pipe(rev.manifest({
      base : 'dist',
      merge: true
    }))
    .pipe(gulp.dest('./dist/'))
    ;

  var assets = gulp.src('./build/assets/**/*')
    .pipe(rev())
    .pipe(gulp.dest('./dist/assets/'))
    .pipe(rev.manifest({
      base : 'dist',
      merge: true
    }))
    .pipe(gulp.dest('./dist/'))
    ;

  var mixes = gulp.src('./build/mixes/**/*')
    .pipe(rev())
    .pipe(gulp.dest('./dist/mixes/'))
    .pipe(rev.manifest({
      base : 'dist',
      merge: true
    }))
    .pipe(gulp.dest('./dist/'))
    ;

  //-- TODO: remove
  var songs = gulp.src('./build/songs/**/*')
    .pipe(rev())
    .pipe(rev.manifest({
      base : 'dist',
      merge: true
    }))
    .pipe(gulp.dest('./dist/songs/'))
    ;
  //-- END TODO

  return merge(scripts, assets, songs, mixes);
});

gulp.task("revreplace", ["rev"], function () {
  var manifest = gulp.src("./dist/rev-manifest.json");

  return gulp.src("./build/index.html")
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest('./dist/'));
});

//gulp.task('usemin', ['clean'], function () {
//  return gulp.src('./build/index.html')
//    .pipe(usemin({
//      js: [rev()],
//      //audio: [rev()]
//    }))
//    .pipe(gulp.dest('./dist/'))
//    ;
//});

//gulp.task('useref', ['clean'], function () {
//  return gulp.src('./build/index.html')
//    .pipe(usemin({
//      js: [rev()],
//      //audio: [rev()]
//    }))
//    .pipe(gulp.dest('./dist/'))
//    ;
//});

gulp.task('watch', function () {
  gulp.watch('./build/**/*', ['default'])
});

gulp.task('default', ['revreplace']);

gulp.task('deploy', function () {
  return gulp.src('./dist/**')
    .pipe(gzip())
    .pipe(s3(awsCredentials, {gzippedOnly: true}))
});

//-- TODO: figure out how to specify order here without requiring build from deploy
//gulp.task('deploy:build', ['build', 'deploy'])