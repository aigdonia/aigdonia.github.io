var gulp        = require('gulp');
var browserSync = require('browser-sync');
var stylus        = require('gulp-stylus');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var jade        = require('gulp-jade');
var inject      = require('gulp-inject');


var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jade', 'styl', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

gulp.task('inject-styl', function(){
	return gulp.src('assets/css/main.styl')
		.pipe(inject( gulp.src(['assets/styl/*.styl']), {
      starttag: function(srcExt, dstExt) { return "// inject:styl"; },
      endtag: function(srcExt, dstExt) { return "// endinject" },
			transform: function(filepath){
        console.log(filepath);
				filepath = filepath.replace('/assets','');
				return '@import "..'+filepath+'" ';
			}
		}))
		.pipe(gulp.dest('assets/css'));
});

gulp.task('styl', ['inject-styl'], function () {
    return gulp.src('assets/css/main.styl')
		.pipe(stylus({
            includePaths: ['assets/styl'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});

gulp.task('jade', function(){
	return gulp.src('_jadefiles/*.jade')
	.pipe(jade())
	.pipe(gulp.dest('_includes'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch(['assets/styl/*.styl'], ['styl']);
  gulp.watch('_jadefiles/*.jade', ['jade'])
  gulp.watch(['*.html', '_layouts/*.html', '_posts/*', '_includes/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
