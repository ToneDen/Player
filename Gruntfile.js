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
                options: {
                    params: {
                        ContentEncoding: 'gzip'
                    }
                },
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
                options: {
                    params: {
                        ContentEncoding: 'gzip'
                    }
                },
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
                        src: 'toneden.loader.temp.js',
                        dest: 'toneden.loader.js.gz'
                    },
                    {
                        src: 'toneden.temp.js',
                        dest: 'toneden.js.gz'
                    }
                ]
            }
        },
        rename: {
            preLoader: {
                src: 'toneden.loader.js',
                dest: 'toneden.loader.temp.js'
            },
            preSDK: {
                src: 'toneden.js',
                dest: 'toneden.temp.js'
            },
            compressedLoader: {
                src: 'toneden.loader.js.gz',
                dest: 'toneden.loader.js'
            },
            compressedSDK: {
                src: 'toneden.js.gz',
                dest: 'toneden.js'
            },
            postLoader: {
                src: 'toneden.loader.temp.js',
                dest: 'toneden.loader.js'
            },
            postSDK: {
                src: 'toneden.temp.js',
                dest: 'toneden.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-cloudfront-clear');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-rename');

    var env = grunt.option('env') || 'dev';

    grunt.registerTask('dev', [
        'rename:preLoader',
        'rename:preSDK',
        'compress',
        'rename:compressedLoader',
        'rename:compressedSDK',
        'aws_s3:dev',
        'cloudfront_clear:dev',
        'rename:postLoader',
        'rename:postSDK'
    ]);

    grunt.registerTask('production', [
        'rename:preLoader',
        'rename:preSDK',
        'compress',
        'rename:compressedLoader',
        'rename:compressedSDK',
        'aws_s3:production',
        'cloudfront_clear:production',
        'rename:postLoader',
        'rename:postSDK'
    ]);

    grunt.registerTask('default', [
        'dev'
    ]);
};
