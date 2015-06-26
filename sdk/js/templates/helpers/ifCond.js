var Handlebars = require('handlebars/runtime');

function ifCond(v1, v2, options) {
    if(v1 || v2) {
        return options.fn(this);
    }
    return options.inverse(this);
}

Handlebars.registerHelper('ifCond', ifCond);

module.exports = ifCond;
