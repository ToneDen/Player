define(function() {
    return {
        protocol: window.location.protocol === 'file:' ? 'http:' : window.location.protocol
    };
});
