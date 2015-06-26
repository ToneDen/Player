var Handlebars = require('handlebars/runtime');

function commanator(num) {
    if(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return '-';
    }
}

Handlebars.registerHelper('commanator', commanator);

module.exports = commanator;
