var gulp = require('gulp');

var paths = {
  scripts: 'app/**/*.js',
  html: 'app/**/*.html',
  appRoot: 'app',
  app: 'app/app.js',
  style: 'app/main.less', // the main LESS file
  build: 'build'
};

var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var express = require('express');
var livereload = require('gulp-livereload');
var embedlr = require("gulp-embedlr");

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('styles', function() {
  return gulp.src(paths.appRoot + '/**/*.less')
    .pipe(less({paths: [ paths.style ]}))
    .pipe(gulp.dest(paths.build + '/css/'));
});

gulp.task('server', function(next) {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static(paths.build)).listen(process.env.PORT || 4000, next);
});

gulp.task('clean', function() {
  gulp.src(paths.build, {read: false})
    .pipe(clean({force: true}));
});

gulp.task('html', function() {
  gulp.src(paths.html)
    .pipe(embedlr())
    .pipe(gulp.dest(paths.build));
});

gulp.task('build', ['scripts', 'styles', 'html'], function() {
  gulp.src(paths.app)
    .pipe(jshint.reporter('fail'))
    .pipe(browserify({
      insertGlobals : true,
      debug : true // enable source maps
    }))
    .pipe(gulp.dest(paths.build))
    .pipe(uglify())
    .pipe(gulp.dest(paths.build + '/app.min.js'));
});

gulp.task('default', ['server', 'build'], function() {
  var server = livereload();

  // Watch sources, when they change force a new build
  gulp.watch(paths.appRoot + '/**', ['build']);

  // On new build, notify the server
  gulp.watch(paths.build + '/**').on('change', function(file) {
    server.changed(file.path);
  });
});
