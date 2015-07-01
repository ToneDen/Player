module.exports = {
    env: env,
    protocol: window.location.protocol === 'file:' ? 'http:' : window.location.protocol
};
