define(['hbs/handlebars'], function(Handlebars) {
	function ifCond(v1, v2, options) {
		if(v1 || v2) {
	    return options.fn(this);
	  }
	  return options.inverse(this);
	}

	Handlebars.registerHelper('ifCond', ifCond);

	return ifCond;
});