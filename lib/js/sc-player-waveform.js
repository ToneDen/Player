/*
	This section doesn't conform to the decoupled idea of this library.
	But we're trying to be comprehensive, so here it as its own class.
	Waveform html is assumed (but not required) to be setup like:
		#waveform
			.buffer
			.played
			img
	
	And the CSS you're likely going to start with is:
		#waveform {
			width: 100%;
			height: 200px;
			position: relative;

			.buffer, .played, > img { position:absolute; width: 0%; height:100%; }
			.buffer { background-color: hsla(180, 20%, 60%, .4);}
			.played { background-color: hsla(260, 20%, 60%, .4);}
			img {  width: 100%; }
		}
*/
var SCWaveform = function(scplayer, config, selectors){
	var defaults = {
		scrub: true  //can be true|false|'click'|'drag'
	};
	
	//keep ref to local scope
	var _this = this;
	this.config = $.extend(defaults, config || {});
	this.dom = $.extend({
		  container: $("#waveform")
		, buffer: $("#waveform").find('.buffer')
		, playbar: $("#waveform").find('.played')
		, waveform: $("#waveform").find('> img')
	}, selectors || {});
	
	
	//local vars
	this.player = scplayer;
	
	//setup
	this.init = function(){
		_this.$waveform = $(_this.config.waveform);
		//make sure it's jquerified
		$.each(this.dom, function(name, elm){
			_this.dom[name] = $(elm);
		});
		
		//bind the events
		_this.bind_events();
		
		//return base object
		return _this;
	};

	//SCPlayer listeners
	//when track is ready
	_this.player.on('scplayer.track.info_loaded', function(e, track){
		_this.load_waveform( track.waveform_url );
	});
	//when loading
	_this.player.on('scplayer.track.whileloading', function(e, percent){
		_this.dom.buffer.css('width', percent + '%');
	});
	//when playing
	_this.player.on('scplayer.track.whileplaying', function(e, percent){
		_this.dom.playbar.css('width', percent + '%');
	});
	//when the track changes
	_this.player.on('scplayer.changing_track', function(e, index){
		_this.dom.playbar.css('width', '0%');
		_this.dom.buffer.css('width', '0%');
	});
	
	//
	_this.load_waveform = function(url){
		_this.dom.waveform.attr('src', url);
	};
	_this.get_relative_mouse_position = function(e){
		var xpos = e.pageX;
		// Calculate the relative position and make sure it doesn't exceed the buffer's current width.
		return Math.min( _this.dom.buffer.width(), (xpos - _this.dom.container.offset().left) / _this.dom.container.width() );
	}
	
	_this.bind_events = function(){
		//allow drag to scrub
		if( _this.config.scrub === true || _this.config.scrub == 'drag'){
			_this.dom.waveform.on('mousedown', function(e){
				e.preventDefault();
				//pause playing
				_this.player.pause();
				//bind mousemove
				_this.dom.waveform.on('mousemove', function(e){
					e.preventDefault();
					var perc = Math.round(_this.get_relative_mouse_position(e) * 100 );
					_this.dom.playbar.css('width', perc + '%');
				});
			});
		}
		//allow click to scrub
		if( _this.config.scrub !== false ){
			_this.dom.waveform.on('click mouseup', function(e){
				e.preventDefault();
				_this.dom.waveform.off('mousemove');
				var relative = _this.get_relative_mouse_position(e);
				_this.player.seek(relative).play();
			});
		}
	};

	return _this.init();
};