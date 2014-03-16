(function(window, undefined) {
    var ToneDen = {};

    if(window.ToneDen) {
        return;
    }

    // Gets the domain that the script was loaded from.
    function getBaseUrl() {
        var scripts = document.getElementsByTagName('script');
        var element;
        var src;

        for (var i = 0; i < scripts.length; i++) {
            element = scripts[i];
            src = element.src;

            if (src && /ToneDen\.js/.test(src)) {
                return /(.+\/)ToneDen\.js/.exec(src)[1];
            }
        }

        return null;
    }

    // Helper function to asynchronously load a script.
    function loadScript(url, callback) {
        var script = document.createElement('script');
        script.async = true;
        script.src = url;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);

        script.onload = script.onreadystatechange = function() {
            var rdyState = script.readyState;

            if (!rdyState || /complete|loaded/.test(script.readyState)) {
                callback();
                script.onload = null;
                script.onreadystatechange = null;
            }
        };
    }

    ToneDen.init = function(callback) {
        var baseUrl = getBaseUrl();

        loadScript(baseUrl + 'sdk.js', callback);
    }

    window.ToneDen = ToneDen;

    // Call all callbacks that the publisher has registered.
    if(window.ToneDenReady && window.ToneDenReady.length) {
        var callbackLength = window.ToneDenReady.length;

        for(var i = 0; i < callbackLength; i++) {
            window.ToneDenReady[i]();
        }
    }
})(this);
