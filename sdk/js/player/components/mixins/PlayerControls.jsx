var Fluxxor = require('fluxxor');
var React = require('react');

module.exports = {
    getInitialState: function() {
        return {
            showVolumeOptions: false
        };
    },
    getPlayer: function() {
        if(this.state && this.state.player) {
            return this.state.player;
        } else {
            return this.props.player;
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
        var player = this.getPlayer();
        var nowPlayingID = player.getIn(['nowPlaying', 'id']);

        var currentIndex = player.get('tracks').findIndex(function(track) {
            return track.get('id') === nowPlayingID;
        });
        var trackToPlay = player.getIn(['tracks', currentIndex + 1]);

        if(trackToPlay) {
            this.getFlux().actions.player.track.select(trackToPlay.toJS());
        }
    },
    onPlayButtonClick: function() {
        this.getFlux().actions.player.track.togglePause(this.getPlayer().get('nowPlaying').toJS());
    },
    onPreviousButtonClick: function() {
        var player = this.getPlayer();
        var nowPlayingID = player.getIn(['nowPlaying', 'id']);

        if(player.getIn(['nowPlaying', 'playbackPosition']) < 4000) {
            var currentIndex = player.get('tracks').findIndex(function(track) {
                return track.get('id') === nowPlayingID;
            });
            var trackToPlay = player.getIn(['tracks', currentIndex - 1]);

            if(trackToPlay) {
                this.getFlux().actions.player.track.select(trackToPlay.toJS());
            }
        } else {
            this.getFlux().actions.player.track.seekTo(player.get('nowPlaying').toJS(), 0);
        }
    },
    onRepeatClick: function() {
        this.getFlux().actions.player.setRepeat(!this.getPlayer().get('repeat'));
    },
    onSetVolumeClick: function(volume) {
        this.setState({
            showVolumeOptions: false
        });
        this.getFlux().actions.player.setVolume(volume);
    },
    onShowVolumeControlsClick: function() {
        this.setState({
            showVolumeOptions: false
        });
    }
};

