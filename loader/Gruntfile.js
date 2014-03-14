module.exports = function(grunt) {
    var config = require('./js/config');

    grunt.initConfig({
        clean: {
            pre: [
                'dist'
            ],
            post: [
                'dist/loader.js',
                'dist/loader.min.js'
            ]
        },
        concat: {
            dev: {
                src: [
                    'js/config.js',
                    'vendor/require.js',
                    'dist/loader.js'
                ],
                dest: 'dist/sdk.load.js'
            },
            production: {
                src: [
                    'js/config.js',
                    'dist/loader.min.js'
                ],
                dest: 'dist/sdk.load.js'
            }
        },
        uglify: {
            production: {
                src: [
                    'vendor/require.js',
                    'dist/loader.js'
                ],
                dest: 'dist/loader.min.js'
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl : './js',
                    name: 'main',
                    out: 'dist/loader.js',
                    optimize: 'none'
                }
            }
        }
    });

    grunt.registerTask('wrap', 'Wraps files in an IIFE.', function() {
        var path = 'dist/sdk.load.js';
        var before = '(function() {\n';
        var after = '\n})();';
        var content = grunt.file.read(path);

        grunt.file.write(path, before + content + after);
    });

    grunt.registerTask('build', [
        'requirejs',
        'uglify:production',
        'concat:production'
    ]);

    grunt.registerTask('default', [
        'clean:pre',
        'build',
        'clean:post',
        'wrap'
    ]);

    grunt.registerTask('dev', [
        'clean:pre',
        'requirejs',
        'concat:dev',
        'clean:post',
        'wrap'
    ]);

    grunt.loadNpmTasks('grunt-contrib');
};
