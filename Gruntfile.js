/**
 * Thanks to Pete Hunt for the great webpack how-to: https://github.com/petehunt/webpack-howto
 */

var webpack = require('webpack');
var env;

if(process.argv.indexOf('--dev') !== -1) {
    env = 'staging';
} else if(process.argv.indexOf('--production') !== -1) {
    env = 'production';
} else {
    env = 'local';
}

var webpackPlugins = [
    new webpack.DefinePlugin({
        env: JSON.stringify(env)
    })
];

if(env !== 'local') {
    webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        mangle: true,
        sourceMap: env === 'local'
    }));
}

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
        webpack: {
            loader: {
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
                        loader: 'handlebars-loader?helperDirs[]=' + process.env.PWD + '/sdk/js/templates/helpers',
                        test: /\.hbs$/
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
            }
        }
    });

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-cloudfront-clear');
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
