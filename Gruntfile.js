/**
 * Thanks to Pete Hunt for the great webpack how-to: https://github.com/petehunt/webpack-howto
 */

var webpack = require('webpack');

var webpackPlugins = [
    new webpack.optimize.UglifyJsPlugin({
        mangle: true
    }),
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: 'dev'
        }
    })
];

var webpackLoaders = [{
    loader: 'style-loader!css-loader',
    test: /\.css$/
}, {
    loader: 'jsx-loader',
    test: /\.jsx$/
}, {
    loader: 'url-loader?limit=8192',
    test: /\.(png|jpg)$/
}, {
    loader: 'handlebars-loader?helperDirs[]=' + process.env.PWD + '/sdk/js/templates/helpers',
    test: /\.hbs$/
}, {
    loader: 'jsx-loader',
    test: /\.jsx$/
}];

var webpackExtensions = ['', '.hbs', '.js', '.jsx', '.css'];

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
        watch: {
            toneden: {
                files: ['loader/**/*', 'sdk/**/*'],
                tasks: ['webpack']
            }
        },
        webpack: {
            toneden: {
                entry: {
                    'toneden.loader': './loader/index.js',
                    toneden: ['./sdk/js/index.js']
                },
                output: {
                    filename: '[name].js'
                },
                module: {
                    loaders: webpackLoaders
                },
                plugins: webpackPlugins,
                resolve: {
                    extensions: webpackExtensions
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-cloudfront-clear');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webpack');

    var env = grunt.option('env') || 'dev';

    grunt.registerTask('dev', [
        'webpack',
        'aws_s3:dev',
        'cloudfront_clear:dev'
    ]);

    grunt.registerTask('production', [
        'webpack',
        'aws_s3:production',
        'cloudfront_clear:production'
    ]);

    grunt.registerTask('default', [
        'webpack'
    ]);
};
