// Middlewares
const gulp = require('gulp'),
	concat = require('gulp-concat'),
	stylus = require('gulp-stylus'),
	babel = require('gulp-babel'),
	cssmin = require('gulp-clean-css'),
	uglify = require('gulp-uglify');

// CSS
gulp.task('css',()=>{
	return gulp.src('public/css/stylus/*.styl')
		.pipe(concat('styles.styl'))
		.pipe(stylus())
		.pipe(cssmin({compatibility:'ie8'}))
		.pipe(gulp.dest('public/css'));
});

// JS
gulp.task('js',()=>{
	return gulp.src('public/js/**/*.js')
		.pipe(concat('scripts.js'))
		.pipe(babel({presets:['es2015']}))
		.pipe(uglify())
		.pipe(gulp.dest('public/js'));
});

// Default
gulp.task('default',()=>{
	gulp.watch(['public/css/stylus/*.styl'],['css']);
	gulp.watch(['public/js/**/*.js'],['js']);
});
