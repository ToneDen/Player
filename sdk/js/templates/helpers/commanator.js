define(['hbs/handlebars'], function(Handlebars) {
    function commanator(num) {
    	if(num) {
        	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
        	return '-';
        }
    }

    Handlebars.registerHelper('commanator', commanator);

    return commanator;
});
