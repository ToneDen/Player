var React = require('react');

var Feed = React.createClass({
    render: function() {
        var nowPlaying = this.props.nowPlaying;

        if(this.props.loading) {
            return (
                <div classNameNameName={'td tdrow player ' + this.props.skin}>
                    <Loader />
                </div>
            );
        }

        /*return (
            <div className={'td tdrow player feed ' + this.props.skin}>
                <div className='tdlarge-12 tdsmall-12 tdcolumns tdlarge-centered tdsmall-centered'>
                    <div className='header tdlarge-2 tdsmall-12 tdcolumns'>
                        <div className='cover tdlarge-12 tdsmall-12 tdcolumns'>
                            <div className='feed-cover'>
                                <img src={nowPlaying.artwork_url || nowPlaying.user.avatar_url} />
                            </div>
                            <div className='controls'>
                                <div className='buttons tdlarge-12 tdsmall-12 tdcolumns'>
                                    <i className='tdicon-play-circle-outline player-play play'></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='feed-container tdlarge-10 tdsmall-12 tdcolumns'>
                        <div className='tdrow info-feed'>
                            <div className='tdlarge-12 tdsmall-12 tdcolumns info'>
                                <div className='song-name tdlarge-12 tdsmall-12 tdcolumns'>
                                    <a href='{{permalink_url}}' target='_blank'>{{title}}</a>
                                </div>
                                <div className='artist-name tdlarge-12 tdsmall-12 tdcolumns'>
                                    <a href='{{user.permalink_url}}' target='_blank'>{{user.username}}</a>
                                </div>
                            </div>
                        </div>
                        {{#if error}}
                            <div className='tdrow'>
                                <div className='tdlarge-12 tdsmall-12 tdcolumns'>
                                    <div className='tdlarge-12 tdsmall-12 tdcolumns track-error-box'>
                                        <span className='track-error-box-span'><i className='tdicon-warning'></i> {{errorMessage}} </span>
                                    </div>
                                </div>
                            </div>
                        {{else}}
                            {{#if streamable}}
                                <div className='tdrow'></div>
                            {{else}}
                                <div className='tdrow'>
                                    <div className='tdlarge-12 tdsmall-12 tdcolumns'>
                                        <div className='tdlarge-12 tdsmall-12 tdcolumns track-error-box'>
                                            <span className='track-error-box-span'><i className='tdicon-warning'></i> This track is not streamable.</span>
                                        </div>
                                    </div>
                                </div>
                            {{/if}}
                        {{/if}}
                        <div className='tdrow social'>
                            <div className='current-song-info tdlarge-12 tdcolumns tdsmall-12'>
                                <div className='track-info-plays tdlarge-10 tdsmall-10 tdcolumns'>
                                    <i className='tdicon-play-circle-fill current-song-social-icon'></i>
                                    {{commanator playback_count}}
                                </div>
                                <div className='feed-buttons tdlarge-2 tdsmall-2 tdcolumns'>
                                    {{#ifCond purchase_url download_url}}
                                        <div className='follow tdlarge-6 tdsmall-12 tdcolumns'>
                                            <a className='tdbutton expand follow-link' href='{{permalink_url}}'  target='_blank'>
                                                <i className='tdicon-soundcloud playlist-social-icon'></i>
                                            </a>
                                        </div>
                                    {{else}}
                                        <div className='follow tdlarge-12 tdsmall-12 tdcolumns'>
                                            <a className='tdbutton expand follow-link' href='{{permalink_url}}'  target='_blank'>
                                                <i className='tdicon-soundcloud playlist-social-icon'></i>
                                            </a>
                                        </div>
                                    {{/ifCond}}
                                    {{#ifCond purchase_url download_url}}
                                        <div className='buy tdlarge-6 tdsmall-12 tdcolumns'>
                                            <a className='tdbutton expand buy-link' href='{{purchase_url}}' target='_blank'>
                                                <i className='tdicon-file-download playlist-social-icon'></i>
                                            </a>
                                        </div>
                                    {{else}}
                                        {{#if download_url}}    
                                            <div className='buy tdlarge-6 tdsmall-12 tdcolumns'>
                                                <a className='tdbutton expand buy-link' href='{{download_url}}' target='_blank'>
                                                    <i className='tdicon-file-download playlist-social-icon'></i>
                                                </a>
                                            </div>
                                        {{/if}}
                                    {{/ifCond}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );*/
    }
});

module.exports = Feed;
