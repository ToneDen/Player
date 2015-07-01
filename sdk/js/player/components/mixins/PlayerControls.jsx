var _ = require('lodash');
var Fluxxor = require('fluxxor');
var React = require('react');

module.exports = {
    mixins: [
        Fluxxor.FluxMixin(React)
    ],
    onNextButtonClick: function() {
        var currentIndex = _.findIndex(this.props.tracks, {
            id: this.props.nowPlaying.id
        });
        var trackToPlay = this.props.tracks[currentIndex + 1];

        if(trackToPlay) {
            this.getFlux().actions.player.track.select(trackToPlay);
        }
    },
    onPlayButtonClick: function() {
        this.getFlux().actions.player.track.togglePause(this.props.nowPlaying);
    },
    onPreviousButtonClick: function() {
        if(this.props.nowPlaying.playbackPosition < 5000) {
            var currentIndex = _.findIndex(this.props.tracks, {
                id: this.props.nowPlaying.id
            });
            var trackToPlay = this.props.tracks[currentIndex - 1];

            if(trackToPlay) {
                this.getFlux().actions.player.track.select(trackToPlay);
            }
        } else {
            this.getFlux().actions.player.track.seekTo(this.props.nowPlaying, 0);
        }
    },
    onScrubberValueChange: function(value) {
        this.getFlux().actions.player.track.seekTo(this.props.nowPlaying, value);
    },
    onTrackRowClick: function(trackID) {
        var trackToPlay = _.find(this.props.tracks, {
            id: trackID
        });

        if(this.props.nowPlaying.id !== trackID) {
            this.getFlux().actions.player.track.select(trackToPlay);
        }
    }
};
