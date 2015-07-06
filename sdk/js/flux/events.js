module.exports = {
    player: {
        audioInterface: {
            TRACK_ERROR: 'player.audioInterface.track_error',
            TRACK_FINISHED: 'player.audioInterface.track_finished',
            TRACK_LOAD_AMOUNT_CHANGED: 'player.audioInterface.track_load_amount_changed',
            TRACK_LOAD_START: 'player.audioInterface.track_load_start',
            TRACK_PLAY_POSITION_CHANGED: 'player.audioInterface.track_play_position_changed',
            TRACK_PLAY_START: 'player.audioInterface.track_play_start',
            TRACK_PLAYING_CHANGED: 'player.audioInterface.track_playing_changed',
            TRACK_READY: 'player.audioInterface.track_ready',
            TRACK_RESOLVED: 'player.audioInterface.track_resolved',
            TRACK_UPDATED: 'player.audioInterface.track_updated'
        },
        CONFIG_UPDATED: 'player.config_updated',
        CREATE: 'player.create',
        DESTROY: 'player.destroy',
        track: {
            SELECTED: 'player.track.selected',
            TOGGLE_PAUSE: 'player.track.toggle_pause'
        }
    }
};
