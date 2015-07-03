var React = require('react');

var Columns = require('../../Columns');

var PlaybackButtons = React.createClass({
    mixins: [
        require('../../mixins/PlayerControls')
    ],
    render: function() {
        var playButtonClass;

        if(this.props.nowPlaying.playing) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <Columns {...this.props}>
                <i className='tdicon-angle-double-left player-prev prev' onClick={this.onPreviousButtonClick} />
                <i className={playButtonClass} onClick={this.onPlayButtonClick} />
                <i className='tdicon-angle-double-right player-next next' onClick={this.onNextButtonClick} />
            </Columns>
        );
    }
});

module.exports = PlaybackButtons;
