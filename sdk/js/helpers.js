var async = require('async');

module.exports = {
    getElementOffset: function(element) {
        var rect = element.getBoundingClientRect();
        return {
            left: rect.left + document.body.scrollLeft,
            top: rect.top + document.body.scrollTop
        };
    },
    msToTimestamp: function(milliseconds) {
        var totalSeconds = Math.round(milliseconds / 1000);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds - minutes * 60;

        if(isNaN(minutes)) {
            minutes = '';
        }

        if(isNaN(seconds)) {
            return '';
        }

        if(seconds < 10) {
            seconds = '0' + seconds;
        }

        return minutes + ':' + seconds;
    },
    numberToCommaString: function(num) {
        if(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '-';
        }
    },
    // Hacky way to wait for the dispatcher to finish dispatching the currently active action. Not sure what the best
    // way to get around this is, as it probably indicates a flaw in our usage of flux. D:
    waitForCurrentAction: function(callback, flux) {
        var interval = 50;
        flux = flux || this.getFlux();

        async.until(function() {
            return !flux.dispatcher.currentActionType;
        }.bind(this), function(done) {
            return setTimeout(done, interval);
        }, callback.bind(this));
    }
};
