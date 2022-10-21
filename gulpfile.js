const fs = require("fs-extra");
const gulp = require("gulp");
const mocha = require("gulp-mocha");
const eslint = require("gulp-eslint");
const ts = require("gulp-typescript");

gulp.task("clean", function (cb) {
	fs.removeSync("dist/**/*");
	cb();
});

gulp.task("test", function () {
	return gulp.src("test/**/*.test.ts").pipe(mocha({ require: ["ts-node/register"], timeout: 5000 }));
});

gulp.task("lint", function () {
	return gulp.src(["src/**/*.ts"]).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
});

gulp.task("ts", function () {
	const tsProject = ts.createProject("tsconfig.json");
	return tsProject.src().pipe(tsProject()).pipe(gulp.dest("dist"));
});

gulp.task("build", gulp.series("clean", "ts"));
