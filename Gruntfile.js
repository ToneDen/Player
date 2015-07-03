/**
 * Thanks to Pete Hunt for the great webpack how-to: https://github.com/petehunt/webpack-howto
 */

var webpack = require('webpack');
var webpackEnv;

if(process.argv.indexOf('--dev') !== -1) {
    webpackEnv = 'staging';
} else if(process.argv.indexOf('--production') !== -1) {
    webpackEnv = 'production';
} else {
    webpackEnv = 'local';
}

var webpackPlugins = [
    new webpack.DefinePlugin({
        env: JSON.stringify(webpackEnv)
    })
];

if(webpackEnv !== 'local') {
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
                debug: true
            },
            dev: {
                options: {
                    gzipRename: true
                },
                files: [
                    {
                        expand: true,
                        src: ['toneden.loader.js', 'toneden.js'],
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
                    gzipRename: true
                },
                files: [
                    {
                        src: ['toneden.loader.js', 'toneden.js'],
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
            sdk: {
                entry: './loader/index.js',
                output: {
                    chunkFilename: 'toneden.js',
                    crossOriginLoading: 'anonymous',
                    filename: 'toneden.loader.js'
                },
                module: {
                    loaders: [{
                        loader: 'style-loader!css-loader',
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
                devtool: webpackEnv === 'local' ? 'inline-source-map' : undefined,
                keepalive: webpackEnv === 'local',
                watch: webpackEnv === 'local'
            }
        }
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-cloudfront-clear');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-webpack');

    grunt.registerTask('default', 'webpack');

    grunt.registerTask('deploy-dev', [
        'webpack',
        'compress:sdk',
        'aws_s3:dev',
        'cloudfront_clear:dev'
    ]);

    grunt.registerTask('deploy-production', [
        'webpack',
        'compress:sdk',
        'aws_s3:production',
        'cloudfront_clear:production'
    ]);
};
