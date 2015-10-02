var async = require('async');
var jsonp = require('jsonp');
var encodeQuerystring = require('querystring/encode');
var request = require('superagent');

var constants = require('../../constants');

var soundcloudApiUrl = constants.protocol + '//api.soundcloud.com/';
var soundcloudResolveUrl = soundcloudApiUrl + 'resolve?url=http://soundcloud.com';

var userAgent = navigator.userAgent;
var isSafari = false;

if(userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
    isSafari = true;
}

function makeSoundCloudRequest(method, url, params, callback) {
    params = params || {};

    // Avoid this problem: http://stackoverflow.com/questions/24175638/remove-cors-accept-encoding-header-on-safari
    if(isSafari) {
        var query = encodeQuerystring(params);
        return jsonp(url + '?' + query, function(err, body) {
            if(err) {
                return callback(err);
            } else {
                return callback(null, {
                    body: body
                });
            }
        });
    } else {
        var requestCreator = request[method](url);

        if(method === 'get') {
            requestCreator.query(params);
        } else {
            requestCreator.send(params);
        }

        return requestCreator.end(function(err, res) {
            if(err) {
                return callback(err, null);
            } else {
                return callback(null, res);
            }
        });
    }
}

function resolve(track, tracksPerArtist, callback) {
    async.waterfall([
        function(next) {
            var query = {
                consumer_key: ToneDen.parameters.soundcloudConsumerKey,
                format: 'json',
            };
            var url;

            if(track.stream_secret) {
                query.secret_token = track.stream_secret
            }


            if(track.stream_id) {
                url = soundcloudApiUrl + 'tracks/' + track.stream_id;
            } else {
                url = soundcloudApiUrl + 'resolve';
                query.url = track.stream_url;
            }

            return makeSoundCloudRequest('get', url, query, next);
        },
        function(res, next) {
            var item = res.body;

            if(item.kind === 'track') {
                return processTrack(item, function(err, track) {
                    return next(err, [track]);
                });
            } else if(item.kind === 'set') {
                return async.map(item.tracks, processTrack, next);
            } else if(item.kind === 'user') {
                return getTracksForUser(item, tracksPerArtist, next);
            }
        }
    ], callback);
}

function getTracksForUser(user, limit, callback) {
    var tracksUrl = soundcloudApiUrl + 'users/' + user.id + '/tracks.json';
    var query = {
        consumer_key: ToneDen.parameters.soundcloudConsumerKey,
        limit: limit
    };

    makeSoundCloudRequest('get', tracksUrl, query, function(err, res) {
        if(err) {
            return callback(err);
        }

        var tracks = res.body;

        return async.map(tracks, processTrack, callback);
    });
}

function processTrack(track, callback) {
    var err = null;
    var queryStringPrefix;

    if(!track.streamable) {
        return callback(new Error('This track is not streamable.'));
    }

    if(track.stream_url.indexOf('?') === -1) {
        queryStringPrefix = '?';
    } else {
        queryStringPrefix = '&';
    }

    track.stream_url += queryStringPrefix + 'consumer_key=' + ToneDen.parameters.soundcloudConsumerKey;

    if(track.artwork_url) {
        track.artwork_url = track.artwork_url.replace('large.jpg', 't500x500.jpg');

        // SoundCloud uses 4 identical CDN domains to allow concurrently loading more images. Randomly select
        // one to load from.
        var between1And4 = Math.round(Math.random() * 3) + 1;

        if(track.artwork_url.indexOf('i1.sndcdn') !== -1) {
            track.artwork_url = track.artwork_url.replace('i1.sndcdn', 'i' + between1And4 + '.sndcdn');
        }
    }

    if(track.download_url) {
        if(track.sharing === 'private') {
            track.download_url += '&client_id=6f85bdf51b0a19b7ab2df7b969233901';
        } else {
            track.download_url += '?client_id=6f85bdf51b0a19b7ab2df7b969233901';
        }
    }

    return callback(null, track);
}

module.exports = {
    resolve: resolve
};
