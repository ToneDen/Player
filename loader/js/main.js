require.config({
    baseUrl: '//publisher.dev',
    namespace: 'ToneDen'
});

// Web setup. Makes ToneDen a global variable.
if(typeof window !== 'undefined') {
    exports = window;

    if(!window.ToneDen) {
        window.ToneDen = {};
    }

    ToneDen = window.ToneDen;
}

// Default loader parameters.
var defaultParameters = {
    baseUrl: 'static.toneden.io/sdk'
};

require([], function() {
    ToneDen.define = define;
    ToneDen.require = require;
    ToneDen.requirejs = requirejs;

    var parameters = defaultParameters;

    /*exports.define = ToneDen.define;
    exports.require = ToneDen.require;
    exports.requirejs = ToneDen.requirejs;*/

    ToneDen.require.config({
        baseUrl: 'http://widget.dev/sdk/dist/',
        enforceDefine: true
    });

    ToneDen.require(['sdk'], function(sdk) {
        ToneDen.sdk = sdk;
    });
});
