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

require(['utils'], function(utils) {
    ToneDen.define = define;
    ToneDen.require = require;
    ToneDen.requirejs = requirejs;

    var parameters = defaultParameters;

    ToneDen.require.config({
        baseUrl: 'http://widget.dev/sdk/dist/',
        enforceDefine: true
    });

    ToneDen.require(['sdk'], function(sdk) {
        ToneDen = utils.extend(ToneDen, sdk);

        if(window.ToneDenReady && window.ToneDenReady.length > 0) {
            for(var i = 0; i < ToneDenReady.length; i++) {
                ToneDenReady[i]();
            }
        }
    });
});
