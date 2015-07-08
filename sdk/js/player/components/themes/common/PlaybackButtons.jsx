var Fluxxor = require('fluxxor');
var React = require('react');

var Columns = require('../../Columns');

var PlaybackButtons = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        require('../../mixins/PlayerControls')
    ],
    getDefaultProps: function() {
        return {
            showNextAndPrevious: true
        };
    },
    render: function() {
        var playButtonClass;

        if(this.props.player.getIn(['nowPlaying', 'playing'])) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <Columns {...this.props}>
                <i
                    className='tdicon-angle-double-left player-prev prev'
                    onClick={this.onPreviousButtonClick}
                    style={{display: this.props.showNextAndPrevious ? '' : 'none'}}
                />
                <i
                    className={playButtonClass}
                    onClick={this.onPlayButtonClick}
                />
                <i
                    className='tdicon-angle-double-right player-next next'
                    onClick={this.onNextButtonClick}
                    style={{display: this.props.showNextAndPrevious ? '' : 'none'}}
                />
            </Columns>
        );
    }
});

module.exports = PlaybackButtons;
