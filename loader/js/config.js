/**
 * This file is concatenated with all the other loader files, so config
 * is accessible to all files in the /loader directory.
 */

var config;
var exports;
var ToneDen;

config = {
    baseUrl: '//widget.dev/sdk'
};

// Web setup. Makes ToneDen a global variable.
if(typeof window !== 'undefined') {
    exports = window;

    if(!window.ToneDen) {
        window.ToneDen = {};
    }

    ToneDen = window.ToneDen;
}

// Grunt setup. Lets us require() this file in Grunt.
if(typeof module !== 'undefined') {
    module.exports = config;
}
