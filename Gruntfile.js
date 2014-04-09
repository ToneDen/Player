module.exports = function(grunt) {
    grunt.initConfig({
        // Upload static files from /dist/ENV/* to s3 and delete files from s3 which don't exist anymore.
        aws_s3: {
            options: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                bucket: 'toneden-sdk',
                debug: false
            },
            dev: {
                files: [
                    {
                        expand: true,
                        src: ['toneden.loader.js', 'toneden.js'],
                        dest: 'dev/',
                        options: {
                            params: {
                                ContentEncoding: 'gzip',
                                ContentType: 'application/javascript'
                            }
                        }
                    }
                ]
            },
            production: {
                files: [
                    {
                        src: ['toneden.loader.js', 'toneden.js'],
                        dest: 'production/',
                        options: {
                            params: {
                                ContentEncoding: 'gzip',
                                ContentType: 'application/javascript'
                            }
                        }
                    }
                ]
            }
        },
        // TODO: Serve with gzip.
        compress: {
            options: {
                mode: 'gzip',
                pretty: true
            },
            main: {
                files: [
                    {
                        expand: true,
                        src: 'toneden.loader.js.temp',
                        dest: 'toneden.loader.js'
                    },
                    {
                        expand: true,
                        src: 'toneden.js.temp',
                        dest: 'toneden.js'
                    }
                ]
            }
        },
        invalidate_cloudfront: {
            options: {
                key: process.env.AWS_ACCESS_KEY_ID,
                secret: process.env.AWS_SECRET_ACCESS_KEY,
                distribution: 'E3SYREX4SS26L7'
            },
            dev: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['/dev/toneden.js', '/dev/toneden.loader.js']
                }]
            },
            production: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['/production/toneden.js', '/production/toneden.loader.js']
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-invalidate-cloudfront');

    var env = grunt.option('env') || 'dev';

    grunt.registerTask('dev', [
        //'rename:pre',
        //'compress',
        'aws_s3:dev',
        'invalidate_cloudfront:dev',
        //'rename:post',
        //'clean:post'
    ]);

    grunt.registerTask('production', [
        //'compress',
        'aws_s3:production',
        'invalidate_cloudfront:production',
        //'clean:post'
    ]);

    grunt.registerTask('default', [
        'dev'
    ]);
};
