module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            pre: [
                'dist'
            ],
            post: [
                'dist/compiled.js',
                'dist/compiled.min.js',
                'dist/templates.js'
            ]
        },
        concat: {
            dev: {
                src: [
                    'dist/compiled.js',
                    'dist/templates.js'
                ],
                dest: 'dist/sdk.js'
            },
            production: {
                src: [
                    'dist/compiled.min.js',
                    'dist/templates.js'
                ],
                dest: 'dist/sdk.js'
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: './js',
                    mainConfigFile: 'js/sdk.js',
                    name: 'sdk', // Has to be the name of the final output file for some reason.
                    optimize: 'none',
                    out: 'dist/compiled.js'
                }
            }
        },
        uglify: {
            production: {
                src: [
                    'dist/compiled.js'
                ],
                dest: 'dist/compiled.min.js'
            }
        }
    });

    grunt.registerTask('wrap', 'Wraps files in an IIFE.', function() {
        var path = 'dist/sdk.js';
        var before = '(function() {\n';
        var after = '\n})();';
        var content = grunt.file.read(path);

        grunt.file.write(path, before + content + after);
    });

    grunt.registerTask('default', [
        'clean:pre',
        'requirejs',
        'uglify',
        'concat:production',
        //'wrap',
        'clean:post'
    ]);

    grunt.registerTask('dev', [
        'clean:pre',
        'requirejs',
        'concat:dev',
        //'wrap',
        'clean:post'
    ]);

    grunt.loadNpmTasks('grunt-contrib');
};
