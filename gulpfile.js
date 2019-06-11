var gulp = require('gulp');
var source = require('vinyl-source-stream');
var ts = require('gulp-typescript');
var merge = require('merge2');

gulp.task('typescript', function() {
  var projectPaths = ['tsconfig.json'];

  projectPaths.forEach((projectPath) => {
    var clientTsProject = ts.createProject(projectPath);

    var clientTsResult = clientTsProject.src().pipe(clientTsProject());

    return merge([
      clientTsResult.pipe(gulp.dest('./')),
      clientTsResult.dts.pipe(gulp.dest('./'))
    ]);
  });
});

gulp.task('clientCopy', ['typescript'], function() {
  return gulp
    .src(['src/**/*.js', 'src/**/*.d.ts'])
    .pipe(gulp.dest('./deploy/'));
});

gulp.task('default', ['typescript', 'clientCopy']);
