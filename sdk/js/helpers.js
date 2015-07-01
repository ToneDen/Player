module.exports = {
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
    }
};
