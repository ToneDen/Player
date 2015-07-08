/**
 * Draggable scrubber component to allow quick movement through the song.
 *
 * Thanks to Jared Forsyth: 
 * http://stackoverflow.com/questions/20926551/recommended-way-of-making-react-component-div-draggable
 */

var Fluxxor = require('fluxxor');
var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var helpers = require('../../../../helpers');

var Scrubber = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React)
    ],
    getDefaultProps: function() {
        return {
            initialPosition: 0
        };
    },
    getInitialState: function() {
        return {
            dragging: false,
            handlePosition: this.props.initialPosition
        };
    },
    componentDidUpdate: function(props, state) {
        if(this.state.dragging && !state.dragging) {
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        } else if(!this.state.dragging && state.dragging) {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    },
    getHandlePosition: function(e) {
        var scrubber = this.refs.scrubber.getDOMNode();

        var minPosition = 0;
        var maxPosition = scrubber.offsetWidth;
        var position = e.pageX - helpers.getElementOffset(scrubber).left;

        if(position < minPosition) {
            return minPosition;
        } else if(position > maxPosition) {
            return maxPosition;
        } else {
            return position;
        }
    },
    onMouseDown: function(e) {
        if(e.button !== 0) {
            return
        }

        this.setState({
            dragging: true,
            handlePosition: this.getHandlePosition(e)
        });

        e.preventDefault();
    },
    onMouseUp: function(e) {
        this.setState({
            dragging: false
        });

        var nowPlaying = this.props.nowPlaying;
        var value = this.state.handlePosition / this.refs.scrubber.getDOMNode().offsetWidth * 
            nowPlaying.getIn(['resolved', 'duration']);

        this.getFlux().actions.player.track.seekTo(nowPlaying.toJS(), value);

        e.preventDefault()
    },
    onMouseMove: function(e) {
        if(!this.state.dragging) {
            return;
        }

        this.setState({
            handlePosition: this.getHandlePosition(e)
        });

        e.preventDefault();
    },
    onScrubberTrackClick: function(e) {
        var track = this.refs.track.getDOMNode();
        var locationToWidthRatio = (e.pageX - helpers.getElementOffset(track).left) / track.offsetWidth;
        var milliseconds = locationToWidthRatio * this.props.nowPlaying.getIn(['resolved', 'duration']);

        this.getFlux().actions.player.track.seekTo(this.props.nowPlaying.toJS(), milliseconds);
    },
    render: function() {
        var nowPlaying = this.props.nowPlaying;
        var resolved = nowPlaying.get('resolved');
        var handlePosition;

        if(nowPlaying.get('error')) {
            return (
                <Row>
                    <Columns>
                        <Columns className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                {nowPlaying.get('errorMessage')}
                            </span>
                        </Columns>
                    </Columns>
                </Row>
            );
        } else if(!resolved.get('streamable')) {
            return (
                <Row>
                    <Columns>
                        <Columns className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                This track is not streamable.
                            </span>
                        </Columns>
                    </Columns>
                </Row>
            );
        } else {
            if(this.refs.scrubber && !this.state.dragging) {
                handlePosition = nowPlaying.get('playbackPosition') / resolved.get('duration') * 
                    this.refs.scrubber.getDOMNode().offsetWidth;
            } else {
                handlePosition = this.state.handlePosition;
            }

            return (
                <Columns className='scrubber-box'>
                    <Columns large={2} className='start-time'>
                        {helpers.msToTimestamp(nowPlaying.get('playbackPosition') || 0)}
                    </Columns>
                    <Columns large={8} className='scrub-bar-box'>
                        <div
                            className='slider'
                            ref='scrubber'
                        >
                            <div className='track' onClick={this.onScrubberTrackClick} ref='track' />
                            <div
                                className='handle'
                                ref='handle'
                                style={{left: handlePosition}}
                                onMouseDown={this.onMouseDown}
                            />
                        </div>
                    </Columns>
                    <Columns large={2} className='stop-time'>
                        {!nowPlaying.get('loading') && 
                            helpers.msToTimestamp(resolved.get('duration') - (nowPlaying.get('playbackPosition') || 0))}
                        {nowPlaying.get('loading') && <i className='tdicon-circle-o-notch spin tdloader' />}
                    </Columns>
                </Columns>
            );
        }
    }
});

module.exports = Scrubber;
