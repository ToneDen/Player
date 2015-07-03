// Web setup. Makes ToneDen a global variable.
if(typeof window !== 'undefined') {
    exports = window;

    if(!window.ToneDen) {
        window.ToneDen = {};
    }

    ToneDen = window.ToneDen;
}

if(env === 'local' || window.location.host === 'publisher.dev') {
    __webpack_public_path__ = '//widget.dev/';
} else if(env === 'staging') {
    __webpack_public_path__ = '//s3-us-west-1.amazonaws.com/toneden-sdk/dev/v2/';
} else if(env === 'production') {
    __webpack_public_path__ = '//sd.toneden.io/production/v2/';
}

require.ensure([], function() {
    window.ToneDen = require('../sdk/js/index');
    window.ToneDen.parameters = window.ToneDen.parameters || {};

    if(window.ToneDenReady && window.ToneDenReady.length > 0) {
        for(var i = 0; i < ToneDenReady.length; i++) {
            ToneDenReady[i]();
        }
    }
}, 'toneden');
