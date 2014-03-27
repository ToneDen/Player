soundcloud-soundmanager-player
==============================

A custom, evented SoundCloud player that uses SoundManager2 to handle audio. Completely decoupled from your HTML/CSS to just handle audio/playlists/tracks, but has events that are easy to hook into. Also includes a waveform module that is loosely coupled to your HTML.


Requirements
------------

+ jQuery (>= 1.7 preferred for events 'on'|'off' syntax)
+ SoundManager2 (tested with V2.97a.20120916)



Next Updates in the works
------------

+ Remove internal event listeners or make them unremovable
+ Allow string or object to be passed instead of tracks array
+ Finish adding ability to pass non-SC mp3s and keep consistency



Basic Usage
===========

The most basic example is a single track (passed as array) and your consumer key (passed in the config object).
```js
var scplayer = new SoundCloudPlayer(
	[ "/diplo/wobble-prod-diplo"]
	, {consumer_key: "XXXXXXXXXXXXXX"}
);
```
If you pass a url like htt(s)://soundcloud.com/diplo/wobble-prod-diplo it will be truncated to /diplo/wobble-prod-diplo for you.


You can also pass in multiple tracks to act as a playlist.
```js
var scplayer = new SoundCloudPlayer(
	[ "/diplo/wobble-prod-diplo"
	, "/diplo/sleigh-bells-demons-diplo"
	, "/abdecaf/feedyourbrain"
	]
	, {consumer_key: "XXXXXXXXXXXXXX"}
);
```

Also, we can now take in sets and parse out the track before moving on
```js
var scplayer = new SoundCloudPlayer(
	[ "/royalbassrecords/sets/dubstep"
	, "/diplo/sleigh-bells-demons-diplo"
	, "/abdecaf/feedyourbrain"
	]
	, {consumer_key: "XXXXXXXXXXXXXX", preload: true}
);
```


Options
-------

We can configure the player with many options. Most control the flow of the playlist. These are the defaults; located at near the top of the class.
```js
{ loop: false        //should the playlsit loop around on the ends
, start_on: 0		 //the default track index to start with
, autoplay: false    //should the play start out playing
, autoswitch: true   //next track in playlist will auto load and play
, volume: 100        //the initial volume
, toggle_pause: true //should pause act as a toggle?
, cache: true        //should it cache the SC track lookups. Browser should handle the audio
, preload: false     //prefetch the SC track data
, debug: false       //console.log() on - has internal logging
}
```


Events
------

The player emits many events. Some are general to the player. Other are specific to the playlist or track. Most events will try to pass relevant data back to the listener. (eg: scplayer.volume returns with the set volume)

Player
+ scplayer.init                  #player initially loads
+ scplayer.play                  #player plays - or attempts to play
+ scplayer.pause                 #player pauses
+ scplayer.stop                  #player stops
+ scplayer.mute                  #player (un)mutes
+ scplayer.position              #player position is set
+ scplayer.volume                #player volume is set
+ scplayer.changing_track        #player changes tracks
+ scplayer.loop_changed          #player looping setting changed.
                                 
Playlist                         
+ scplayer.playlist.next         #playlist moves to next track
+ scplayer.playlist.looped       #playlist hits next from end track with looping on, returns to start
+ scplayer.playlist.ended        #playlist reaches the end and stops
+ scplayer.playlist.prev         #playlist moves to prev track
+ scplayer.playlist.looped       #playlist hits prev from first track with looping on, goes to last track
+ scplayer.playlist.restarted    #playlist hits prev from first track with looping off
+ scplayer.playlist.preloaded    #playlist has preloaded all SC data
                                 
Track                            
+ scplayer.track.info_loaded     #track has SC info loaded
+ scplayer.track.bindable        #SM2 object is created and methods can be called/bound
+ scplayer.track.ready           #track is fully buffered and can be played through
+ scplayer.track.finished        #track finishes playing
+ scplayer.track.whileloading    #track event with buffering is going on
+ scplayer.track.whileplaying    #track event updates play position while playing
+ scplayer.track.played          #track triggers play - actually played
+ scplayer.track.paused          #track pauses
+ scplayer.track.resumed         #track resumes from pause
+ scplayer.track.stopped         #track is stopped



Public Methods
--------------
The player exposes a lot of methods. They should be self explanatory.

Public methods
+ play()
+ pause(force=false) #pass true to force a pause if also using toggle_pause
+ stop()
+ next(autoplay)  #overrides the autoswitch config
+ prev(autoplay)  #overrides the autoswitch config
+ goto(index)     #change track by playlist index
+ mute()
+ seek(position)
+ restart_track()
+ get_time()	  #gets the current time, based on position like m:ss. Pretty weak. Better roll your own with something like moment.js
+ destroy()		  #tried to destroy all internals and mark for garbage collection (it doesn't)

Property Getter/Setter
+ volume(vol)
+ position(pos)
+ loop(true|false) #overrides the value passed in the config. Should be safe to do while running.
+ has_next()	  #returns bool; has a next track to move to - taking into account looping and playlist length
+ has_prev()	  #returns bool; has a next track to move to - taking into account looping and playlist length

Event emiter/listener
+ on(eventname, function)
+ trigger(eventname, args...)

Internal object getter
+ track() (current track)	
+ track_index() (index of current track)
+ sound() (the SM2 sound object for current track)
+ playlist() (same one you passed)
+ track_info(id|url) (gets SC track data from cache or ajax. returns a promise in case a request has to be made)



Chainable
---------
Most of the public player methods can be chained together

```js
scplayer.pause().next().play().volume(75);
```

Track Info
----------
If you want to lookup the SC data about a track, that isn't necessarily the current track, and want to do it in an async way: here's how it's done.
```js
//Notice the done. Using jQuery Deferreds
//Looking up track index 4. Could also pass a SC url - full or trimmed.
//Will pull form cache if already looked up and caching on. But could be any SC track really.
var track_index = 4;
scplayer.track_info( track_index ).done(function(track){
	//console.log(track);
});
```


Examples
========

Most of the time, you're going to call public methods and listen for events. -- more to come
```js
//new SC player
var scplayer = new SoundCloudPlayer(
	[ "/diplo/wobble-prod-diplo"
	, "/diplo/sleigh-bells-demons-diplo"
	, "/abdecaf/feedyourbrain"
	]
	, {consumer_key: "XXXXXXXXXXXXXX", autoplay: false, toggle_pause: true}
);
//clicking play
$('#playbtn').on('click', function(){
	//will work because of toggle_pause
	scplayer.pause();
});
//show pause status
scplayer.on('scplayer.pause', function(e, is_paused){
	if( is_paused === true ){
		$('#playbtn').addClass('paused');
	}else{
		$('#playbtn').removeClass('paused');
	}
});
//show playing progress
scplayer.on('scplayer.track.whileplaying', function(e, percent){
	$('.playhead').css('width', percent + '%');
	$('.track_time').text( scplayer.get_time() );
});
```





Waveform
========

Also included is a waveform module. It's just a wrapper for the most common setup for SC waveforms. It takes a player object, config options, and an override for the selectors.

Basic usage
-----------

This will get you a basic player and waveform. It's assuming a lot.
```js
//new SC player
var scplayer = new SoundCloudPlayer(
	[ "/diplo/wobble-prod-diplo"]
	, {consumer_key: "XXXXXXXXXXXXXX"}
);
//new waveform, passing the player
var scwaveform = new SCWaveform(scplayer);
```

Options
-------

There's only on option right now: Srubbing. It can be on, off, only clicking, or allow dragging. Dragging my be a little buggy.
```js
{ scrub: true  //can be true|false|'click'|'drag'
}
```

This is assuming some basic HTML structure.
```jade
#waveform
	.buffer
	.played
	img
```

Also a bit of css.
```less
#waveform {
	width: 100%;
	height: 200px;
	position: relative;

	.buffer, .played, > img { position:absolute; width: 0%; height:100%; }
	.buffer { background-color: hsla(180, 20%, 60%, .4);}
	.played { background-color: hsla(260, 20%, 60%, .4);}
	img {  width: 100%; }
}
```

But you can override the selectors. Takes either a css selector, dom element, or a jQuery object
```js
var scwaveform = new SCWaveform(scplayer, {scrub:true}, {
	  container: "#waveform"
	, buffer: $("#waveform").find('.buffer')
	, playbar: $("#waveform").find('.played')
	, waveform: $("#waveform").find('> img')
});
```


Better waveforms w/ Waveform.js
========
[Waveform.js](http://waveformjs.org/) is a badass library for SoundCloud waveforms which utilizes HTML5 Canvas.
It's built to work with the SoundCloud SDK, but with a little code you can use it with this library. A little harder to get working, but the results are killer.

Mad credits to the authors: [Johannes Wagener](http://johannes.wagener.cc/) and [Lee Martin](http://leemart.in/)


This works by hooking into the internal sound and track objects, and then calling the waveform.js functions with the scope of the sound object.

```js
//load your player
var scplayer = new SoundCloudPlayer(
	[ "/diplo/wobble-prod-diplo"]
	, {consumer_key: "XXXXXXXXXXXXXX"}
);

//setup waveform.js
var waveform = new Waveform({
	container: $("#waveform").get(0),
	innerColor: "rgba(255, 255, 255, 0.2)"
});

//wait until the SM2 object is loaded enough to be bound to
scplayer.on('scplayer.track.bindable', function(e, track, sound){
	//get waveform.js to pull the waveform form the track
	waveform.dataFromSoundCloudTrack(track);
	//get the waveform update functions back, pass your sweet colors here
	var waveform_updater = waveform.optionsForSyncedStream({
		  playedColor: "#7E99AE"
		, loadedColor: "rgba(255, 255, 255, 0.8)"
		, defaultColor: "rgba(255, 255, 255, 0.2)"
	});
	//a little slower than direct, but let the events pass down to the waveform updater
	scplayer.on('scplayer.track.whileloading', function(e){
		waveform_updater.whileloading.call(sound);
	});
	scplayer.on('scplayer.track.whileplaying', function(e){
		waveform_updater.whileplaying.call(sound);
	});
});
```

Your markup and styles are much simpler
```jade
#waveform
```
```less
#waveform {
	width: 200px;
	height: 24px;
}
```


License
-------

This work is licensed under a Creative Commons Attribution 3.0 Unported License.
by [Keith Hoffmann][] based on a work at [github.com][].
![http://creativecommons.org/licenses/by/3.0/](http://i.creativecommons.org/l/by/3.0/88x31.png) http://creativecommons.org/licenses/by/3.0/

  [Keith Hoffmann]: http://www.eyesandearsentertainment.com
  [github.com]: https://github.com/kilokeith/soundcloud-soundmanager-player