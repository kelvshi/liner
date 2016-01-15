var path = require('path');
var bone = require('bone');
var less = bone.require('bone-act-less');
var include = bone.require('bone-act-include');
var concat = bone.require('bone-act-concat');

var connect = require('bone-cli-connect');
var build = require('bone-cli-build');

var dist = bone.dest('dist');
var staticDir = dist.dest('static');

// dist/pages
dist.dest('pages')
    .src('~/pages/*.html');

// dist/static/images
staticDir.dest('images')
    .src('~/assets/images/**/*');

// dist/static/css
staticDir.dest('css')
    .cwd('~/assets/less')
    .src('./**/style.less')
    .dir('')
    .act(less)
    .rename(function(fileName, sourcePath, fileProperty) {
        return path.basename(fileProperty.dir) + '.css';
    });

// dist/static/fonts
staticDir.dest('fonts')
    .src('~/vendors/fonticon/fonts/*');

// dist/static/index.html
staticDir.src('~/src/index.html')
    .act(include);

// dist/static/js/lib.js
staticDir.dest('js')
    .src('~/vendors/seajs/sea.js')
    .act(concat({
        files: [
            '~/vendors/jquery/jquery-1.11.2.js',
            '~/vendors/underscore/Underscore_1.8.3.js',
            '~/vendors/backbone/Backbone_1.1.2.js'
        ]
    }))
    .act(bone.wrapper(function(buffer, encoding, callback) {
        var versionFetch = "seajs.on('fetch', function(data) {\
            if (data.uri) {\
                data.requestUri = data.uri + '?v="+bone.cli.pkg.version+"'\
            }\
        });";

        this.cacheable();

        versionFetch = new Buffer(versionFetch);

        callback(null, Buffer.concat([buffer, versionFetch]));
    }))
    .rename('lib.js');

// dist/static/js/app.js
staticDir.dest('js')
    .src('~/src/app.js')
    .act(concat({
        files: [
            '~/src/helper/*.js',
            '~/src/model/*.js'
        ]
    }));

// dist/static/js/(other js)
staticDir.dest('js')
    .src('~/src/!(helper|model)/*.js')
    .act(include);

// 切页面使用任务，base指向dist，开启livereload
bone.task('page', {
    cli: connect({
        base: 'dist',
        livereload: true
    })
});
// 开发使用任务,base指向dist/static
bone.task('dev', {
    cli: connect({
        base: 'dist/static'
    })
});

bone.cli(build());

bone.task('release', {
    exec: 'build'
}, {
    exec: 'grunt'
});