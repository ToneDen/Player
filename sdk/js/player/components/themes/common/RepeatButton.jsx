var React = require('react');

var RepeatButton = React.createClass({
    mixins: [
        require('../../mixins/PlayerControls')
    ],
    render: function() {
        return (
            <i
                className={'tdicon-repeat repeat-init ' + (this.props.repeat ? 'repeat-on' : '')}
                onClick={this.onRepeatClick}
            />
        );
    }
});

module.exports = RepeatButton;
