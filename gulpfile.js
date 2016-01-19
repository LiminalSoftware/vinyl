var gulp           = require('gulp')
  , merge          = require('merge-stream')
  , rev            = require('gulp-rev')
  , del            = require('del')
  , revReplace     = require('gulp-rev-replace')
  , vinylPaths     = require('vinyl-paths')
  , gzip           = require('gulp-gzip')
  , s3             = require('../gulp-s3')
  , fs             = require('fs')
  , mirror         = require('gulp-mirror')
  , awsCredentials = JSON.parse(fs.readFileSync('./.aws.json'))
  ;

gulp.task('clean', function () {
  return del('./dist/')
});

gulp.task('rev', function () {
  var scripts = gulp.src('./dist/*.js')
    .pipe(vinylPaths(del))
    .pipe(rev())
    .pipe(gulp.dest('./dist/'))
    .pipe(mirror(
      rev.manifest('./dist/rev-index-manifest.json', {
        base : 'dist', merge: true
      }),
      rev.manifest('./dist/rev-other-manifest.json', {
        base : 'dist', merge: true
      })
    ))
    .pipe(gulp.dest('./dist/'))
    ;

  var assets = gulp.src('./build/assets/**/*')
    .pipe(rev())
    .pipe(gulp.dest('./dist/assets/'))
    .pipe(mirror(
      rev.manifest('./dist/rev-index-manifest.json', {
        base : 'dist', merge: true
      }),
      rev.manifest('./dist/rev-other-manifest.json', {
        base : 'dist', merge: true
      })
    ))
    .pipe(gulp.dest('./dist/'))
    ;

  var mixes = gulp.src('./build/mixes/**/*')
    .pipe(rev())
    .pipe(gulp.dest('./dist/mixes/'))
    .pipe(rev.manifest('./dist/rev-index-manifest.json', {
      base : 'dist', merge: true
    }))
    .pipe(gulp.dest('./dist/'))
    ;

  return merge(scripts, assets, mixes);
});

gulp.task("revreplace", ["rev"], function () {
  var indexManifest = gulp.src("./dist/rev-index-manifest.json")
    , otherManifest = gulp.src('./dist/rev-other-manifest.json')
    ;

  var index = gulp.src('./build/index.html')
    .pipe(revReplace({manifest: indexManifest}))
    .pipe(gulp.dest('./dist/'));

  var other = gulp.src([
      './build/download.html',
      './build/error.html'
    ])
    .pipe(revReplace({manifest: otherManifest}))
    .pipe(gulp.dest('./dist/'));

  return merge(index, other);
});

gulp.task('watch', function () {
  gulp.watch('./build/**/*', ['default'])
});

gulp.task('default', ['revreplace']);

gulp.task('deploy', ['deploy:code', 'deploy:assets', 'deploy:mixes']);

gulp.task('deploy:code', function () {
  return gulp.src('./dist/*')
    //-- TODO: use gzip
    //.pipe(gzip())
    .pipe(s3(awsCredentials))
});

gulp.task('deploy:assets', function () {
  return gulp.src('./dist/assets/**/*')
    //-- TODO: use gzip
    //.pipe(gzip())
    .pipe(s3(awsCredentials))
});

gulp.task('deploy:mixes', function () {
  return gulp.src('./dist/mixes/**/*')
    //-- TODO: use gzip
    //.pipe(gzip())
    .pipe(s3(awsCredentials))
});

//-- TODO: figure out how to specify order here without requiring build from deploy
//gulp.task('deploy:build', ['build', 'deploy'])