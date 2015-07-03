var _ = require('lodash');
var Fluxxor = require('fluxxor');
var React = require('react');

module.exports = {
    mixins: [
        Fluxxor.FluxMixin(React)
    ],
    getInitialState: function() {
        return {
            showVolumeOptions: false
        };
    },
    propsOrState: function() {
        if(this.state.tracks) {
            return this.state;
        } else {
            return this.props;
        }
    },
    onKeyDown: function(e) {
        if(e.keyCode === 32) {
            this.onPlayButtonClick();
            e.preventDefault();
        } else if(e.keyCode === 39) {
            this.onNextButtonClick();
            e.preventDefault();
        } else if(e.keyCode === 37) {
            this.onPreviousButtonClick();
            e.preventDefault();
        }
    },
    onNextButtonClick: function() {
        var propsOrState = this.propsOrState();

        var currentIndex = _.findIndex(propsOrState.tracks, {
            id: propsOrState.nowPlaying.id
        });
        var trackToPlay = propsOrState.tracks[currentIndex + 1];

        if(trackToPlay) {
            this.getFlux().actions.player.track.select(trackToPlay);
        }
    },
    onPlayButtonClick: function() {
        this.getFlux().actions.player.track.togglePause(this.propsOrState().nowPlaying);
    },
    onPreviousButtonClick: function() {
        var propsOrState = this.propsOrState();

        if(propsOrState.nowPlaying.playbackPosition < 4000) {
            var currentIndex = _.findIndex(propsOrState.tracks, {
                id: propsOrState.nowPlaying.id
            });
            var trackToPlay = propsOrState.tracks[currentIndex - 1];

            if(trackToPlay) {
                this.getFlux().actions.player.track.select(trackToPlay);
            }
        } else {
            this.getFlux().actions.player.track.seekTo(propsOrState.nowPlaying, 0);
        }
    },
    onRepeatClick: function() {
        this.getFlux().actions.player.setRepeat(!this.propsOrState().repeat);
    },
    onSetVolumeClick: function(volume) {
        this.setState({
            showVolumeOptions: false
        });

        this.getFlux().actions.player.setVolume(volume);
    },
    onShowVolumeControlsClick: function() {
        this.setState({
            showVolumeOptions: true
        });
    }
};

