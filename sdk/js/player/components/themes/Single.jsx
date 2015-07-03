var React = require('react');

var Columns = require('../Columns');
var Loader = require('../Loader');
var PlaybackButtons = require('./common/PlaybackButtons');
var Row = require('../Row');
var RepeatButton = require('./common/RepeatButton');
var Scrubber = require('./common/Scrubber');
var Volume = require('./common/Volume');

var helpers = require('../../../helpers');

var Single = React.createClass({
    componentDidMount: function() {
        var container = this.props.container;

        if(this.props.tracks.length > 1){
            container.find('.prev').show();
            container.find('.next').show();
        } else {
            container.find('.prev').hide();
            container.find('.next').hide();
        }

        //container responsiveness
        if(container.width() < 400) {
            container.find('.header').addClass('header-small').css('width', '100%');
            container.find('.solo-container').addClass('solo-container-small').css('width', '100%').prependTo(container.find('.solo-buttons'));
            container.find('.scrubber').hide();
        }
    },
    render: function() {
        if(this.props.loading) {
            return <Loader />;
        }

        var nowPlaying = this.props.nowPlaying;

        return (
            <Columns large-centered={true} small-centered={true}>
                <a href='https://www.toneden.io' target='_blank' className='tdicon-td_logo-link'>
                    <i className='tdicon-td_logo' />
                </a>
                <Columns large={4} small={12} className='header'>
                    <Columns className='cover'>
                        <div className='solo-cover'>
                            <img src={nowPlaying.resolved.artwork_url || nowPlaying.resolved.user.avatar_url} />
                        </div>
                        <div className='controls'>
                            <PlaybackButtons className='buttons' {...this.props} />
                        </div>
                    </Columns>
                    <Columns className='solo-buttons'>
                        <Columns
                            large={nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url ? 6 : 12}
                            small={12}
                            className='follow'
                        >
                            <a className='tdbutton expand follow-link' href={nowPlaying.resolved.permalink_url} target='_blank'>
                                <i className='tdicon-soundcloud playlist-social-icon' />
                            </a>
                        </Columns>
                        <Columns large={6} small={12} className='buy'>
                            <a
                                className='tdbutton expand buy-link'
                                href={nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url}
                                target='_blank'
                            >
                                {this.props.useCustomPurchaseTitle ? nowPlaying.resolved.purchase_title : 'BUY'}
                                {!nowPlaying.resolved.purchase_url && 'DOWNLOAD'}
                            </a>
                        </Columns>
                    </Columns>
                </Columns>
                <Columns large={8} small={12} className='solo-container'>
                    <Row className='info-solo'>
                        <Columns large={2} small={12} className='repeat-column'>
                            <RepeatButton repeat={this.props.repeat} />
                        </Columns>
                        <Columns large={8} small={12} className='info'>
                            <Columns className='song-name'>
                                <a href={nowPlaying.resolved.permalink_url} target='_blank'>
                                    {nowPlaying.resolved.title}
                                </a>
                            </Columns>
                            <Columns className='artist-name'>
                                <a href={nowPlaying.resolved.user.permalink_url} target='_blank'>
                                    {nowPlaying.resolved.user.username}
                                </a>
                            </Columns>
                        </Columns>
                        <Columns large={2} small={12} className='volume-controls'>
                            <Volume volume={this.props.volume} />
                        </Columns>
                    </Row>
                    {nowPlaying.error && (
                        <Row>
                            <Columns>
                                <Columns className='track-error-box'>
                                    <span className='track-error-box-span'>
                                        <i className='tdicon-warning' />
                                        {nowPlaying.errorMessage}
                                    </span>
                                </Columns>
                            </Columns>
                        </Row>
                    )}
                    {nowPlaying.resolved.streamable && (
                        <Row className='scrubber'>
                            <Scrubber nowPlaying={nowPlaying} />
                        </Row>
                    )}
                    {!nowPlaying.resolved.streamable && (
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
                    )}
                    <Row className='social'>
                        <Columns className='current-song-info'>
                            <Columns large={6} className='track-info-plays'>
                                <i className='tdicon-play-circle-fill current-song-social-icon'></i>
                                {helpers.numberToCommaString(nowPlaying.resolved.playback_count)}
                            </Columns>
                            <Columns large={6} className='track-info-favorites'>
                                <i className='tdicon-heart current-song-social-icon' />
                                {helpers.numberToCommaString(nowPlaying.resolved.favoritings_count)}
                            </Columns>
                        </Columns>
                    </Row>
                </Columns>
            </Columns>
        );
    }
});

module.exports = Single;
