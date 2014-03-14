define(['soundmanager2'], function(soundManager) {
    //object slice
    __slice = [].slice;

    //set the default options for SM2
    //call setup for SM2, which inits all this
    if(typeof soundManager != 'undefined'){
        soundManager.setup({
              //url: 'swf/'
            debugMode: false
            , debugFlash: false
            , flashVersion: 9
            , useFlashBlock: false
            , useHighPerformance: true
            , useHTML5Audio: true
            , useFastPolling: true
            , wmode: 'transparent'
        });
    }

    /* SCPLAYER EVENTS */
    /*
        scplayer.init
        scplayer.play
        scplayer.pause
        scplayer.stop
        scplayer.mute
        scplayer.position
        scplayer.volume
        scplayer.changing_track
        scplayer.loop_changed

    */
    /* SCPLAYER PLAYLIST EVENTS */
    /*
        scplayer.playlist.next
        scplayer.playlist.looped
        scplayer.playlist.ended
        scplayer.playlist.prev
        scplayer.playlist.looped
        scplayer.playlist.restarted
        scplayer.playlist.goto
        scplayer.playlist.preloaded
    */
    /* SCPLAYER TRACK EVENTS */
    /*
        scplayer.track.info_loaded
        scplayer.track.bindable
        scplayer.track.ready
        scplayer.track.finished
        scplayer.track.whileloading
        scplayer.track.whileplaying
        scplayer.track.played
        scplayer.track.paused
        scplayer.track.resumed
        scplayer.track.stopped
    */

    //SoudCloud Player class
    //v0.9.6
    var SoundCloudPlayer = function(tracks, config){
        var defaults = {
              loop: false
            , start_on: 0
            , autoplay: false
            , autoswitch: true //for playlists
            , volume: 100
            , toggle_pause: true //should pause act as a toggle?
            , cache: true //caches the SC track lookup. Browser should handle the audio
            , preload: false //prefetch the sc track data
            , debug: false
        }
        , sc_resolve_url = "http://api.soundcloud.com/resolve?url=http://soundcloud.com"
        , urlregex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
        
        //keep ref to local scope
        var _this = this, $this = jQuery(this);
        
        //local vars
        this.tracks = [];
        this.config = jQuery.extend(defaults, config);
        this.current_track_index = this.config.start_on;
        this.current_track = null;
        this.sound = null;

        //flag for if we're already inited
        this.inited = false;
        
        //hold a state so when you hit play it'll play on the correct sound when it's ready
        this.play_when_ready = false;
        //hold a cache for SC lookups
        this.cache = {};
        
        //setup
        this.init = function(){
            //don't re-init
            if(_this.inited) return;
            
            _this.change_track();
            _this.trigger('scplayer.init');
            if(_this.config.autoplay) _this.play();
            //set flag
            _this.inited = true;
        };
        
        //load a track form a trimmed SC url
        this.change_track = function(index){
            _this.log('change_track');
            //destroy the old sound
            if(_this.sound){
                _this.sound.destruct();
                _this.sound = null;
            }
            
            
            var i = (typeof index != 'undefined' )? index : _this.current_track_index;
            if( index != _this.current_track_index || !index){
                var url = _this.tracks[i];
                _this.resolve_track(url, _this.set_sound);
                _this.trigger('scplayer.changing_track', i);
            }
            return _this;
        }
        
        
        /* ---- public methods ---- */
        
        //playlist related methods
        this.play = function(){
            _this.log('play');
            //if the sound it there and ready, get to it
            if( _this.sound && _this.sound.readyState == 3 ){
                _this.sound.play();
            }else{
                //or hold a state to come back to when ready
                _this.play_when_ready = true;
            }
            _this.trigger('scplayer.play', _this.current_track_index);
            
            return _this;
        };
        this.pause = function(force){
            force = (force != null) ? force : false;
            if(_this.sound){
                if(_this.config.toggle_pause && !force) _this.sound.togglePause();
                else _this.sound.pause();
                _this.trigger('scplayer.pause', _this.sound.paused);
            }
            return _this;
        };
        this.resume = function(force){
            force = (force != null) ? force : false;
            if(_this.sound){
                if(_this.config.toggle_pause && !force) _this.sound.togglePause();
                else _this.sound.resume();
                _this.trigger('scplayer.pause', _this.sound.paused);
            }
            return _this;
        };
        this.stop = function(){
            if(_this.sound) _this.sound.stop();
            _this.trigger('scplayer.stop');
            _this.log('stop');
            return _this;
        };
        this.next = function(autoplay){
            _this.log('next');
            //play the next track?
            _this.play_when_ready = (typeof autoplay != 'undefined')? autoplay : _this.config.autoswitch;
            _this.log(_this.play_when_ready);
            
            if( _this.tracks[ _this.current_track_index+1 ] ){
                _this.current_track_index++;
                _this.change_track();
                _this.trigger('scplayer.playlist.next', _this.current_track_index-1, _this.current_track_index);
                _this.log('has next');
            }else if( _this.config.loop ){
                _this.current_track_index = 0;
                _this.change_track();
                _this.trigger('scplayer.playlist.looped');
                _this.log('looped');
            }else{
                _this.current_track_index = _this.tracks.length-1
                _this.trigger('scplayer.playlist.ended');
                _this.log('no mas');
            }
            return _this;
        };
        this.prev = function(autoplay){
            //play the next track?
            _this.play_when_ready = (typeof autoplay != 'undefined')? autoplay : _this.config.autoswitch;
            
            if( _this.tracks[ _this.current_track_index-1 ] ){
                _this.current_track_index--;
                _this.change_track();
                _this.trigger('scplayer.playlist.prev');
            }else if( _this.config.loop ){
                _this.current_track_index = _this.tracks.length-1;
                _this.change_track();
                _this.trigger('scplayer.playlist.looped');
            }else{
                _this.current_track_index = 0;
                _this.trigger('scplayer.playlist.restarted');
            }
            return _this;
        };
        this.goto = function(index, autoplay){
            _this.log('goto');
            //play the next track?
            _this.play_when_ready = (typeof autoplay != 'undefined')? autoplay : _this.config.autoswitch;
            
            if( _this.tracks[ index ] ){
                _this.current_track_index = index;
                _this.trigger('scplayer.playlist.goto');
                _this.change_track();
            }
            return _this;
        };
        
        //sound related methods
        this.restart_track = function(){
            _this.position(0);
            return _this;
        };
        this.mute = function(){
            if(_this.sound) _this.sound.toggleMute();
            _this.trigger('scplayer.mute', _this.sound.muted);
            return _this;
        };
        
        //could we move to the next track
        this.has_next = function(){
            _this.log('has next');
            if( _this.tracks[ _this.current_track_index+1 ] ){
                return true;
            }else if( _this.config.loop && _this.tracks.length > 1 ){
                return true;
            }
            return false;
        };
        //could we move to the prev track
        this.has_prev = function(){
            if( _this.tracks[ _this.current_track_index-1 ] ){
                return true;
            }else if( _this.config.loop && _this.tracks.length > 1 ){
                return true;
            }
            return false;
        };
        
        
        this.get_time = function(){
            var time = this.position();
            var ms = time % 1000
              , s = Math.floor((time / 1000) % 60)
              , m = Math.floor((time / (60 * 1000)) % 60)
              , h = Math.floor((time / (60 * 60 * 1000)) % 24)
              ;
            var t = m + ':' + _this.pad(s);
            if(h > 0) t = h + ':' + t;
            return t;
        };
        
        this.position = function(pos){
            if(_this.sound){
                if(pos || pos === 0){
                    //limit to bounds
                    pos = Math.min(_this.sound.duration, pos);
                    pos = Math.max(0, pos);
                    //setter
                    _this.trigger('scplayer.position', pos);
                    return _this.sound.setPosition(pos);
                }else{
                    //getter
                    _this.trigger('scplayer.position', _this.sound.position);
                    return _this.sound.position;
                }
            }
            
            return 0;
        };
        this.volume = function(vol){
            if(_this.sound){
                if(vol || vol === 0){
                    //limit to bounds
                    vol = Math.min(100, vol);
                    vol = Math.max(0, vol);
                    //setter
                    _this.trigger('scplayer.volume', vol);
                    _this.config.volume = vol;
                    return _this.sound.setVolume(vol);
                }else{
                    //getter
                    _this.trigger('scplayer.volume', _this.sound.volume);
                    return _this.sound.volume;
                }
            }
            
            return _this.config.volume;
        };
        //seeking
        this.seek = function(relative){
            // Calculate a new position given the click's relative position and the track's duration.
            var pos = _this.current_track.duration * relative;
            _this.position(pos);
            return _this;
        };
        //looping
        this.loop = function(do_loop){
            if(do_loop){
                _this.config.loop = do_loop;
                _this.trigger('scplayer.loop_changed', _this.config.loop);
            }
            return _this.config.loop;
        };
        
        //lookup a track's data, from cache or do a lookup. Takes id or url
        this.track_info = function(id){
            if( _this.isNumeric(id) ){
                id = _this.tracks[id];
            }
            return _this.resolve_track(id);
        };
        
        //events - using jquery
        this.on = function(evnt, cb){
            return $this.on(evnt, cb);
        };
        this.trigger = function(evnt){
            var args = (arguments.length > 1) ? __slice.call(arguments, 1) : [];
            return $this.trigger(evnt, args);
        };
        
        //does whatever we can to mark for garbage collection
        this.destroy = function(){
            if(_this.sound) _this.sound.destruct()
            _this.tracks = [];
            $this.off();
            $this.remove();
            _this.tracks = null;
            _this.track = null;
            _this = null;
            delete _this.tracks;
            delete _this.track;
            delete _this;
            delete this;
        };
        /* ---- private methods ---- */
        _this.get_track = function(){ return _this.current_track; };
        _this.get_track_index = function(){ return _this.current_track_index; };
        _this.get_sound = function(){ return _this.sound; };
        _this.get_playlist = function(){ return _this.tracks; };
        
        _this.set_cache = function(url, track){
            if(_this.config.cache === true){
                _this.cache[url] = track;
            }
        };
        _this.get_cache = function(url){
            if(_this.config.cache === true){
                return _this.cache[url] || null;
            }
            return null;
        };
        _this.set_sound = function(track){
            _this.log('set_sound');
            //
            _this.trigger('scplayer.track.info_loaded', track);
            //store the current track object
            _this.current_track = track;
            //get a SC url
            var url = track.stream_url;
            url += (url.indexOf("secret_token") == -1) ? '?' : '&';
            url += 'consumer_key=' + _this.config.consumer_key;
            
            //
            //setup the SM2 sound object
            _this.sound = soundManager.createSound({
                  autoLoad: true
                , id: 'track_' + track.id
                , multiShot: false
                , loops: 1
                , url: url
                , volume: _this.config.volume
                , whileloading: function() {
                    //only whole number percents
                    var percent = Math.round(this.bytesLoaded / this.bytesTotal * 100);
                    _this.trigger('scplayer.track.whileloading', percent);
                }
                , whileplaying: function() {
                    //round to nearest 10th of a percent for performance
                    var percent = Math.round(this.position / track.duration * 100 * 10) / 10;
                    _this.trigger('scplayer.track.whileplaying', percent);
                }
                , onplay: function() {
                    _this.log('track.onplay');
                    _this.trigger('scplayer.track.played');
                }
                , onresume: function() {
                    _this.trigger('scplayer.track.resumed');
                }
                , onstop: function() {
                    _this.trigger('scplayer.track.stopped');	
                }
                , onpause: function() {
                    _this.trigger('scplayer.track.paused');
                }
                , onfinish: function() { 
                    _this.trigger('scplayer.track.finished');
                }
                , onload: function() {
                    _this.log('onload');
                    _this.trigger('scplayer.track.ready', _this.current_track_index, _this.current_track);
                }
            });
            
            //
            _this.trigger('scplayer.track.bindable', track, _this.sound);
        };
        
        //gets a SC url and goes to SC to fetch the track data
        _this.resolve_track = function(url, cb){
            //new promise
            var promise = new jQuery.Deferred();
            
            //allow non SC tracks (watch for bugs)
            //look for a url, but not soundcloud.com
            if( url.match(urlregex) && url.search(/soundcloud\.com/i) === -1){
                var _track = {stream_url:url, id:0, permalink_url:url, duration:0};
                promise.resolve(_track);
            }
            
            //auto trim urls
            url = url.replace(/https?\:\/\/soundcloud\.com/gi, "");
            
            //if we're cahcing check cache first
            if( _this.config.cache === true ){
                var track = _this.get_cache(url);
                if(track && cb){
                    
                    promise.done(function(){
                        cb(track);
                    }).resolve();
                    return promise;
                }
            }
            
            //define a complete condition for the promise
            promise.done(function(_track){
                if( _track.tracks && _track.tracks.length > 0 ){
                    var tracks = _this.parse_tracks(url, _track.tracks);
                    _track = tracks[0];
                }else{
                    //maybe cache the track
                    if( _this.config.cache === true ) _this.set_cache(url, _track);
                }
                if(cb) cb(_track);
            });
            
            //call the ajax
            jQuery.ajax({
                  url: sc_resolve_url+url+
                    '&format=json'+
                    '&consumer_key='+_this.config.consumer_key+
                    '&callback=?'
                , dataType: 'jsonp'
                , error: function(jqXHR, textStatus, errorThrown){
                    promise.reject(jqXHR, textStatus, errorThrown);
                }
                , success: function(_track){
                    promise.resolve(_track);
                }
            });
            return promise;
        };
        
        //preload the SC track info
        _this.preload_sc_tracks = function(cb){
            var promises = [];
            for(var x=0, l=_this.tracks.length; x<l; x++){
                var _track = _this.tracks[x];
                var promise = _this.resolve_track(_track);
                promises.push(promise);
            }
            
            //have to do apply to pass many promises as list instead of array
            jQuery.when.apply(jQuery, promises).then(
                function(){
                    _this.trigger('scplayer.playlist.preloaded');
                    if(cb) cb();
                },
                function(){
                    _this.log('promises failed to preload tracks');
                }
            );
        };
        
        //save track to the cache
        _this.parse_tracks = function(url, _tracks){
            var set_tracks = [], track_urls = []
              , start_index = _this.tracks.indexOf(url);

            for(var x=0, l=_tracks.length; x<l; x++){
                var _track = _tracks[x];
                //slice out track url - begins with http://soundcloud.com/
                var trackurl = _track.permalink_url.substring(21);
                
                //cache tracks
                if( _this.config.cache === true ) _this.set_cache(trackurl, _track);
                set_tracks.push(_track);
                track_urls.push(trackurl);
            }
            //splice at start_index, delete 1, splice in expanded tracks
            var args = [start_index, 1].concat(track_urls);
            //add tracks to playlist
            _this.tracks.splice.apply(_this.tracks, args);
            
            return set_tracks;
        };
        

        _this.add_tracks = function(tracks){
            //take a single string or array of strings
            if(typeof tracks == 'string') tracks = [tracks];
            //tracks were passed
            if(tracks != null && tracks.length > 0){
                //add the tracks to the tracks array
                _this.tracks = _this.tracks.concat(tracks);

                //preload SC data? or init
                if(_this.config.preload == true) _this.preload_sc_tracks.call(_this, _this.init);
                else _this.init.call(_this);
            }
        };

        _this.log = function(){
            if(_this.config.debug && window.console) console.log.apply(console, arguments);
        };
        
        //helper utilities
        _this.isNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        _this.pad = function(num) {
             return (num < 10 ? '0' : '') + num;
        };
        
        /* internal events */
        _this.on('scplayer.track.ready', function(e){
            _this.log('track.onready!!!');
            if( _this.play_when_ready == true ){
                _this.play();
                _this.play_when_ready = false;
            }
        });
        _this.on('scplayer.track.finished', function(e){
            _this.log('track finished');
            if(_this.config.autoswitch && (_this.config.loop || _this.has_next())){
                _this.log('finished and autoswitch');
                _this.next().play();
            }
        });
        //this shouldn't be necessary, but we want to make sure.
        _this.on('scplayer.playlist.ended', function(e){
            _this.log('playlist ended');
            if(!_this.config.loop) _this.stop();
        });
        
        
        
        //init everything when we're sure SM2 has loaded
        soundManager.onready(function() {
            _this.log('SOUNDMANAGER2 ready!!');
            //load the tracks
            _this.add_tracks(tracks);
        });
        //detect timeout for loading SM2 swf
        soundManager.ontimeout(function() {
            if(window.console) console.log('SOUNDMANAGER2 TIMEDOUT!!');
        });
        
        //expose only the public methods
        return {
              play: 		this.play
            , pause: 		this.pause
            , resume: 		this.resume
            , stop: 		this.stop
            , next: 		this.next
            , prev: 		this.prev
            , mute: 		this.mute
            , get_time: 	this.get_time
            , volume: 		this.volume
            , restart_track: this.restart_track
            , goto: 		this.goto
            , position: 	this.position
            , seek: 		this.seek
            , track_info: 	this.track_info
            , has_next:		this.has_next
            , has_prev:		this.has_prev
            , on: 			this.on
            , trigger: 		this.trigger
            , track: 		this.get_track 		//expose the current track playing
            , track_index: 	this.get_track_index //expose the current track index
            , sound: 		this.get_sound 		//expose the current SM2 object
            , playlist: 	this.get_playlist 	//expose the playlist
            , destroy: 		this.destroy 		//make all internals for garbage collection
            , add_tracks: 	this.add_tracks 		//append tracks to a player
        };
    };
});
