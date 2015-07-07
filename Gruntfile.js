/**
 * Thanks to Pete Hunt for the great webpack how-to: https://github.com/petehunt/webpack-howto
 */

var webpack = require('webpack');
var webpackEnv;

if(process.argv.indexOf('--production') !== -1 || process.argv.indexOf('deploy-production') !== -1) {
    webpackEnv = 'production';
} else if(process.argv.indexOf('--dev') !== -1 || process.argv.indexOf('deploy-dev') !== -1) {
    webpackEnv = 'staging';
} else {
    webpackEnv = 'local';
}

var webpackPlugins = [
    new webpack.DefinePlugin({
        env: JSON.stringify(webpackEnv)
    })
];

if(webpackEnv === 'production') {
    webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        mangle: true,
        sourceMap: webpackEnv === 'local'
    }));
}

module.exports = function(grunt) {
    grunt.initConfig({
        aws_s3: {
            options: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                bucket: 'toneden-sdk',
                debug: false
            },
            dev: {
                options: {
                    gzipRename: 'ext'
                },
                files: [
                    {
                        expand: true,
                        src: ['toneden.loader.js.gz', 'toneden.js.gz'],
                        dest: 'dev/v2/',
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
                    gzipRename: 'ext'
                },
                files: [
                    {
                        src: ['toneden.loader.js.gz', 'toneden.js.gz'],
                        dest: 'production/v2/',
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
        clean: {
            postUpload: {
                src: ['toneden.js.gz', 'toneden.loader.js.gz']
            }
        },
        cloudfront_clear: {
            dev: {
                access_key: process.env.AWS_ACCESS_KEY_ID,
                secret_key: process.env.AWS_SECRET_ACCESS_KEY,
                dist: 'E3SYREX4SS26L7',
                resourcePaths: ['/dev/v2/toneden.loader.js', '/dev/v2/toneden.js']
            },
            production: {
                access_key: process.env.AWS_ACCESS_KEY_ID,
                secret_key: process.env.AWS_SECRET_ACCESS_KEY,
                dist: 'E3SYREX4SS26L7',
                resourcePaths: ['/production/v2/toneden.loader.js', '/production/v2/toneden.js']
            }
        },
        compress: {
            sdk: {
                files: [{
                    dest: 'toneden.js.gz',
                    src: 'toneden.js'
                }, {
                    dest: 'toneden.loader.js.gz',
                    src: 'toneden.loader.js'
                }],
                pretty: true
            }
        },
        webpack: {
            watch: {
                entry: './loader/index.js',
                output: {
                    chunkFilename: 'toneden.js',
                    crossOriginLoading: 'anonymous',
                    filename: 'toneden.loader.js'
                },
                module: {
                    loaders: [{
                        loader: 'style-loader?insertAt=start!css-loader',
                        test: /\.css$/
                    }, {
                        loader: 'jsx-loader',
                        test: /\.jsx$/
                    }, {
                        loader: 'url-loader?limit=8192',
                        test: /\.(png|jpg)$/
                    }, {
                        loader: 'jsx-loader',
                        test: /\.jsx$/
                    }]
                },
                plugins: webpackPlugins,
                resolve: {
                    extensions: ['', '.hbs', '.js', '.jsx', '.css']
                },
                devtool: 'inline-source-map',
                keepalive: true,
                watch: true
            },
            build: {
                entry: './loader/index.js',
                output: {
                    chunkFilename: 'toneden.js',
                    crossOriginLoading: 'anonymous',
                    filename: 'toneden.loader.js'
                },
                module: {
                    loaders: [{
                        loader: 'style-loader?insertAt=start!css-loader',
                        test: /\.css$/
                    }, {
                        loader: 'jsx-loader',
                        test: /\.jsx$/
                    }, {
                        loader: 'url-loader?limit=8192',
                        test: /\.(png|jpg)$/
                    }, {
                        loader: 'jsx-loader',
                        test: /\.jsx$/
                    }]
                },
                plugins: webpackPlugins,
                resolve: {
                    extensions: ['', '.hbs', '.js', '.jsx', '.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-cloudfront-clear');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-webpack');

    if(webpackEnv === 'local') {
        grunt.registerTask('default', 'webpack:watch');
    } else {
        grunt.registerTask('default', 'webpack:build');
    }

    function getBuildConfig(env) {
        return [
            'webpack:build',
            'compress:sdk',
            'aws_s3:' + env,
            'clean:postUpload',
            'cloudfront_clear:' + env
        ]
    }

    grunt.registerTask('deploy-dev', getBuildConfig('dev'));
    grunt.registerTask('deploy-production', getBuildConfig('production'));
};
