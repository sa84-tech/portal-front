"use strict";

const gulp = require("gulp");
const webpack = require("webpack-stream");
const browsersync = require("browser-sync");
const sass = require("gulp-sass");
const autoprefixer = require("autoprefixer");
const cleanCSS = require("gulp-clean-css");
const postcss = require("gulp-postcss");

// const dist = "/Applications/MAMP/htdocs/test"; // Ссылка на вашу папку на локальном сервере
const dist = "./dist";

gulp.task("copy-html", () => {
  return gulp.src("./src/index.html")
    .pipe(gulp.dest(dist))
    .pipe(browsersync.stream());
});

gulp.task("copy-assets", () => {
  return gulp.src("./src/assets/**/*.*")
    .pipe(gulp.dest(dist + '/assets'))
    .on('end', browsersync.reload);
});

gulp.task("build-sass", () => {
  return gulp.src("./src/assets/sass/style.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dist))
    .pipe(browsersync.stream());
});

gulp.task("build-bs-sass", () => {
  return gulp.src('node_modules/bootstrap/scss/bootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dist))
    .pipe(browsersync.stream());
});

gulp.task('build-bs-js', () => {
  return gulp.src(['node_modules/@fortawesome/fontawesome-free/js/all.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/popper.js/dist/umd/popper.min.js'
    ])
    .pipe(gulp.dest(dist + "/js"))
    .pipe(browsersync.stream());
});

gulp.task('icons', function () {
  return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest(dist + '/assets/webfonts/'))
    .pipe(browsersync.stream());
});

gulp.task("build-js", () => {
  return gulp.src("./src/js/main.js")
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: 'script.js'
      },
      watch: false,
      devtool: "source-map",
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  debug: true,
                  corejs: 3,
                  useBuiltIns: "usage"
                }]
              ]
            }
          }
        }]
      }
    }))
    .pipe(gulp.dest(dist))
    .on("end", browsersync.reload);
});

gulp.task("watch", () => {
  browsersync.init({
    server: "./dist/",
    port: 4000,
    notify: true
  });

  gulp.watch("./src/index.html", gulp.parallel("copy-html"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("build-js"));
  gulp.watch("./src/assets/sass/**/*.scss", gulp.parallel("build-sass"));
});

gulp.task("build", gulp.parallel("copy-html", "copy-assets", "build-js", "build-sass", "build-bs-sass", 'build-bs-js', 'icons'));

gulp.task("prod", () => {
  gulp.src("./src/sass/style.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist));

  return gulp.src("./src/js/main.js")
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: 'script.js'
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  corejs: 3,
                  useBuiltIns: "usage"
                }]
              ]
            }
          }
        }]
      }
    }))
    .pipe(gulp.dest(dist));
});

gulp.task("default", gulp.parallel("watch", "build"));