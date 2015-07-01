var React = require('react');

var Feed = React.createClass({
    componentDidMount: function() {
        if(parameters.tracks.length > 1){
            container.find('.prev').show();
            container.find('.next').show();
        } else {
            container.find('.prev').hide();
            container.find('.next').hide();
        }

        //container responsiveness
        if(container.width() < 400) {
            container.find('.header').addClass('header-small').css('width', '100%');
            container.find('.solo-container').addClass('solo-container-small').css('width', '100%').prependTo(container.find('.solo-buttons'));
            container.find('.scrubber').hide();
        }
    },
    render: function() {
        if(this.props.loading) {
            return (
                <div classNameNameName={'td tdrow player ' + this.props.skin}>
                    <Loader />
                </div>
            );
        }
    }
});

module.exports = Feed;
