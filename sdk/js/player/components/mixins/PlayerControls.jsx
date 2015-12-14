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
        // Ignore if we're in a textarea or text input.
        var targetTag = e.target.tagName.toLowerCase();
        if(targetTag === 'input' || targetTag === 'textarea') {
            return;
        }

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
        this.getFlux().actions.player.nextTrack(this.getPlayer().get('id'));
    },
    onPlayButtonClick: function() {
        var nowPlaying = this.getPlayer().get('nowPlaying');

        if(nowPlaying) {
            this.getFlux().actions.player.track.togglePause(nowPlaying.toJS());
        }
    },
    onPreviousButtonClick: function() {
        var player = this.getPlayer();
        var nowPlaying = player.get('nowPlaying');

        if(player.getIn(['nowPlaying', 'playbackPosition']) < 4000) {
            this.getFlux().actions.player.previousTrack(player.get('id'));
        } else if(nowPlaying) {
            this.getFlux().actions.player.track.seekTo(nowPlaying, 0);
        }
    },
    onRepeatClick: function() {
        this.getFlux().actions.player.setRepeat(!this.props.repeat);
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

