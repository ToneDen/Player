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
        cloudfront_clear: {
            dev: {
                access_key: process.env.AWS_ACCESS_KEY_ID,
                secret_key: process.env.AWS_SECRET_ACCESS_KEY,
                dist: 'E3SYREX4SS26L7',
                resourcePaths: ['/dev/toneden.loader.js', '/dev/toneden.js']
            },
            production: {
                access_key: process.env.AWS_ACCESS_KEY_ID,
                secret_key: process.env.AWS_SECRET_ACCESS_KEY,
                dist: 'E3SYREX4SS26L7',
                resourcePaths: ['/production/toneden.loader.js', '/production/toneden.js']
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
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-cloudfront-clear');
    grunt.loadNpmTasks('grunt-contrib-compress');

    var env = grunt.option('env') || 'dev';

    grunt.registerTask('dev', [
        //'rename:pre',
        //'compress',
        'aws_s3:dev',
        'cloudfront_clear:dev',
        //'rename:post',
        //'clean:post'
    ]);

    grunt.registerTask('production', [
        //'compress',
        'aws_s3:production',
        'cloudfront_clear:production',
        //'clean:post'
    ]);

    grunt.registerTask('default', [
        'dev'
    ]);
};
