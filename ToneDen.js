(function(window, undefined) {
    var ToneDen = {};

    if(window.ToneDen) {
        return;
    }

    function getScriptUrl() {
        var scripts = document.getElementsByTagName('script');
        var element;
        var src;

        for (var i = 0; i < scripts.length; i++) {
            element = scripts[i];
            src = element.src;

            if (src && /toneden-player\.js/.test(src)) {
                return src;
            }
        }

        return null;
    }

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
        var scriptUrl = getScriptUrl();
        var baseUrl = /(.+\/)ToneDen\.js/.exec(scriptUrl)[1];

        loadScript(baseUrl + 'sdk.js', callback);
    }

    window.ToneDen = ToneDen;
})(this);
