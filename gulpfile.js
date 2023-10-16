/*
* @Description: gulp
* @Author: 安知鱼
* @Email: 2268025923@qq.com
* @Date: 2022-02-22 11:22:57
* @LastEditTime: 2022-08-18 12:24:11
* @LastEditors: 安知鱼
*/
import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import htmlclean from 'gulp-htmlclean';
import workbox from 'workbox-build';
import fontmin from 'gulp-fontmin';

// 若使用babel压缩js，则取消下方注释，并注释terser的代码
// var uglify = require('gulp-uglify');
// var babel = require('gulp-babel');

// 若使用terser压缩js
import terser from 'gulp-terser';

//pwa
gulp.task('generate-service-worker', () => {
  return workbox.injectManifest({
    swSrc: './sw-template.js',
    swDest: './public/sw.js',
    globDirectory: './public',
    globPatterns: [
      // 缓存所有以下类型的文件，极端不推荐
      // "**/*.{html,css,js,json,woff2,xml}"
      // 推荐只缓存404，主页和主要样式和脚本。
      '404.html',
      'index.html',
      'js/main.js',
      'css/index.css',
    ],
    modifyURLPrefix: {
      '': './',
    },
  });
});

//minify js babel
// 若使用babel压缩js，则取消下方注释，并注释terser的代码
// gulp.task('compress', () =>
//   gulp.src(['./public/**/*.js', '!./public/**/*.min.js'])
// 		.pipe(babel({
// 			presets: ['@babel/preset-env']
// 		}))
//     .pipe(uglify().on('error', function(e){
//       console.log(e);
//     }))
// 		.pipe(gulp.dest('./public'))
// );

// minify js - gulp-tester
// 若使用terser压缩js
gulp.task('compress', () =>
  gulp
    .src([
      './public/**/*.js',
      '!./public/**/*.min.js',
      '!./public/js/custom/galmenu.js',
      '!./public/js/custom/gitcalendar.js',
    ])
    .pipe(terser())
    .pipe(gulp.dest('./public'))
);

//css
gulp.task('minify-css', () => {
  return gulp
    .src('./public/**/*.css')
    .pipe(
      cleanCSS({
        compatibility: 'ie11',
      })
    )
    .pipe(gulp.dest('./public'));
});

// 压缩 public 目录内 html
gulp.task('minify-html', () => {
  return gulp
    .src('./public/**/*.html')
    .pipe(htmlclean())
    .pipe(
      htmlmin({
        removeComments: true, //清除 HTML 註释
        collapseWhitespace: true, //压缩 HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除 <script> 的 type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除 <style> 和 <link> 的 type="text/css"
        minifyJS: true, //压缩页面 JS
        minifyCSS: true, //压缩页面 CSS
        minifyURLs: true,
      })
    )
    .pipe(gulp.dest('./public'));
});

//压缩字体
function minifyFont(text, cb) {
  gulp
    .src('./public/fonts/*.ttf') //原字体所在目录
    .pipe(
      fontmin({
        text: text,
      })
    )
    .pipe(gulp.dest('./public/fontsdest/')) //压缩后的输出目录
    .on('end', cb);
}

gulp.task('mini-font', cb => {
  var buffers = [];
  gulp
    .src(['./public/**/*.html']) //HTML文件所在目录请根据自身情况修改
    .on('data', function (file) {
      buffers.push(file.contents);
    })
    .on('end', function () {
      var text = Buffer.concat(buffers).toString('utf-8');
      minifyFont(text, cb);
    });
});

// 执行 gulp 命令时执行的任务
gulp.task(
  'default',
  gulp.series(
    'generate-service-worker',
    gulp.parallel('compress', 'minify-html', 'minify-css', 'mini-font')
  )
);


var gulp = require("gulp");
var debug = require("gulp-debug"); // 修改 Error in plugin "gulp-htmlmin" 异常
var babel = require("gulp-babel")
var cleancss = require("gulp-clean-css"); //css 压缩组件
var uglify = require("gulp-uglify"); //js 压缩组件
var htmlmin = require("gulp-htmlmin"); //html 压缩组件
var htmlclean = require("gulp-htmlclean"); //html 清理组件
var imagemin = require("gulp-imagemin"); // 图片压缩组件
var changed = require("gulp-changed"); // 文件更改校验组件
var gulpif = require("gulp-if"); // 任务 帮助调用组件
var plumber = require("gulp-plumber"); // 容错组件（发生错误不跳出任务，并报出错误内容）
var isScriptAll = true; // 是否处理所有文件，(true| 处理所有文件)(false| 只处理有更改的文件)
var isDebug = true; // 是否调试显示 编译通过的文件
var gulpBabel = require("gulp-babel");
var es2015Preset = require("babel-preset-es2015");
var del = require("del");
var Hexo = require("hexo");
var hexo = new Hexo(process.cwd(), {}); // 初始化一个 hexo 对象

// 清除 public 文件夹
gulp.task("clean", function () {
    return del(["public/**/*"]);
});

// 下面几个跟 hexo 有关的操作，主要通过 hexo.call()去执行，注意 return
// 创建静态页面 （等同 hexo generate）
gulp.task("generate", function () {
    return hexo.init().then(function () {
        return hexo
            .call("generate", {
                watch: false
            })
            .then(function () {
                return hexo.exit();
            })
            .catch(function (err) {
                return hexo.exit(err);
            });
    });
});

// 启动 Hexo 服务器
gulp.task("server", function () {
    return hexo
        .init()
        .then(function () {
            return hexo.call("server", {});
        })
        .catch(function (err) {
            console.log(err);
        });
});

// 部署到服务器
gulp.task("deploy", function () {
    return hexo.init().then(function () {
        return hexo
            .call("deploy", {
                watch: false
            })
            .then(function () {
                return hexo.exit();
            })
            .catch(function (err) {
                return hexo.exit(err);
            });
    });
});

// 压缩 public 目录下的 js 文件
gulp.task("compressJs", function () {
    return gulp
        .src(["./public/**/*.js", "!./public/libs/**"]) // 排除的 js
        .pipe(gulpif(!isScriptAll, changed("./public")))
        .pipe(gulpif(isDebug, debug({title: "Compress JS:"})))
        .pipe(plumber())
        .pipe(
            gulpBabel({
                presets: [es2015Preset] // es5 检查机制
            })
        )
        .pipe(uglify()) // 调用压缩组件方法 uglify(), 对合并的文件进行压缩
        .pipe(gulp.dest("./public")); // 输出到目标目录
});

// 压缩 public 目录下的 css 文件
gulp.task("compressCss", function () {
    var option = {
        rebase: false,
        //advanced: true,               // 类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
        compatibility: "ie7" // 保留 ie7 及以下兼容写法 类型：String 默认：''or'*'[启用兼容模式；'ie7'：IE7 兼容模式，'ie8'：IE8 兼容模式，'*'：IE9+ 兼容模式]
        //keepBreaks: true,             // 类型：Boolean 默认：false [是否保留换行]
        //keepSpecialComments: '*'      // 保留所有特殊前缀 当你用 autoprefixer 生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    };
    return gulp
        .src(["./public/**/*.css", "!./public/**/*.min.css"]) // 排除的 css
        .pipe(gulpif(!isScriptAll, changed("./public")))
        .pipe(gulpif(isDebug, debug({title: "Compress CSS:"})))
        .pipe(plumber())
        .pipe(cleancss(option))
        .pipe(gulp.dest("./public"));
});

// 压缩 public 目录下的 html 文件
gulp.task("compressHtml", function () {
    var cleanOptions = {
        protect: /<\!--%fooTemplate\b.*?%-->/g, // 忽略处理
        unprotect: /<script [^>]*\btype="text\/x-handlebars-template"[\s\S]+?<\/script>/gi // 特殊处理
    };
    var minOption = {
        collapseWhitespace: true, // 压缩 HTML
        collapseBooleanAttributes: true, // 省略布尔属性的值  <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, // 删除所有空格作属性值    <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, // 删除 <script> 的 type="text/javascript"
        removeStyleLinkTypeAttributes: true, // 删除 <style> 和 <link> 的 type="text/css"
        removeComments: true, // 清除 HTML 注释
        minifyJS: true, // 压缩页面 JS
        minifyCSS: true, // 压缩页面 CSS
        minifyURLs: true // 替换页面 URL
    };
    return gulp
        .src("./public/**/*.html")
        .pipe(gulpif(isDebug, debug({title: "Compress HTML:"})))
        .pipe(plumber())
        .pipe(htmlclean(cleanOptions))
        .pipe(htmlmin(minOption))
        .pipe(gulp.dest("./public"));
});

// 压缩 public/uploads 目录内图片
gulp.task("compressImage", function () {
    var option = {
        optimizationLevel: 5, // 类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, // 类型：Boolean 默认：false 无损压缩 jpg 图片
        interlaced: false, // 类型：Boolean 默认：false 隔行扫描 gif 进行渲染
        multipass: false // 类型：Boolean 默认：false 多次优化 svg 直到完全优化
    };
    return gulp
        .src("./public/medias/**/*.*")
        .pipe(gulpif(!isScriptAll, changed("./public/medias")))
        .pipe(gulpif(isDebug, debug({title: "Compress Images:"})))
        .pipe(plumber())
        .pipe(imagemin(option))
        .pipe(gulp.dest("./public"));
});
// 执行顺序： 清除 public 目录 -> 产生原始博客内容 -> 执行压缩混淆 -> 部署到服务器
gulp.task(
    "build",
    gulp.series(
        "clean",
        "generate",
        "compressHtml",
        "compressCss",
        "compressJs",
        "compressImage",
        gulp.parallel("deploy")
    )
);

// 默认任务
gulp.task(
    "default",
    gulp.series(
        "clean",
        "generate",
        gulp.parallel("compressHtml", "compressCss", "compressImage", "compressJs")
    )
);
//Gulp4 最大的一个改变就是 gulp.task 函数现在只支持两个参数，分别是任务名和运行任务的函数