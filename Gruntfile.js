module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            dist: ['dist/static_min']
        },
        copy: {
            dist: {
                expand: true,
                cwd: 'dist/static',
                src: '**',
                dest: 'dist/static_min/'
            }
        },
        strip: {
            build: {
                src: 'dist/static_min/**/*.js',
                options: {
                    inline: true
                }
            }
        },
        cssUrlRewrite: {
            dist: {
                files: [{
                    expand: true,
                    src: "dist/static_min/css/*.css",
                    dest: "./"
                }],
                options: {
                    skipExternal: true,
                    rewriteUrl: function(url, options, dataURI) {
                        if (url.indexOf('data:') == 0) { //base64不处理
                            return url;
                        } else {
                            var path = url.replace('dist/static_min/', '../');
                            var hash = require('crypto').createHash('md5').update(dataURI).digest('hex');
                            return path + '?v=' + hash.substr(-6);
                        }
                    }
                }
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/static_min/js',
                    src: '**/*.js',
                    dest: 'dist/static_min/js'
                }]
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/static_min/css',
                    src: '**/*.css',
                    dest: 'dist/static_min/css'
                }]
            }
        },
        sprite: {
            icons: {
                src: 'assets/sprite/icons/img/*.png',
                dest: 'assets/images/icons_sprite.png',
                destCss: 'assets/sprite/icons/icons.css',
                cssTemplate: 'assets/sprite/icons/css.mustache',
                imgPath: '../images/icons_sprite.png',
                padding: 8
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-css-url-rewrite');
    grunt.loadNpmTasks('grunt-spritesmith');

    grunt.registerTask('default', ['clean', 'copy', 'strip', 'cssUrlRewrite', 'cssmin', 'uglify']);
};