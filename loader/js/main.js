// Default loader parameters.
var defaultParameters = {
    baseUrl: config.baseUrl
};

require([], function() {
    ToneDen.define = define;
    ToneDen.require = require;
    ToneDen.requirejs = requirejs;

    var parameters = defaultParameters;

    // If we have a custom baseUrl set, we're in a dev environment.
    // This means we need to explicitly define requirejs' functions
    // as globals, because requirejs isn't getting loaded by the
    // optimizer.
    if(parameters.baseUrl !== defaultParameters.baseUrl) {
        // exports is the window.
        exports.define = ToneDen.define;
        exports.require = ToneDen.require;
        exports.requirejs = ToneDen.requirejs;
    }

    ToneDen.require.config({
        baseUrl: parameters.baseUrl + '/js'
    });

    ToneDen.require(['sdk'], function(sdk) {
        ToneDen.sdk = sdk;
    });
});
