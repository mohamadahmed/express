/**
 * Created by mahmed on 12.06.17.
 */
"use strict";

var gulp = require('gulp');
var uglify = require("gulp-uglify");
var cleanCSS = require('gulp-clean-css');

//Gulp minify CSS
gulp.task('minify-css', function() {
    return gulp.src('./public/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./public'));
});

//Gulp uglify js
gulp.task('minify-js', function () {
    gulp.src('./server.js')
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});
