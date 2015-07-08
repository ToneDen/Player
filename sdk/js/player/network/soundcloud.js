var async = require('async');
var request = require('superagent');

var constants = require('../../constants');

var soundcloudApiUrl = constants.protocol + '//api.soundcloud.com/';
var soundcloudResolveUrl = soundcloudApiUrl + 'resolve?url=http://soundcloud.com';

function resolve(url, tracksPerArtist, callback) {
    url = url.replace(/https?\:\/\/(www\.)?soundcloud\.com/gi, '');

    async.waterfall([
        function(next) {
            request.get(soundcloudResolveUrl + url)
                .query({
                    consumer_key: ToneDen.parameters.soundcloudConsumerKey,
                    format: 'json'
                })
                .end(next);
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

    request.get(tracksUrl)
        .query({
            consumer_key: ToneDen.parameters.soundcloudConsumerKey,
            limit: limit
        })
        .end(function(err, res) {
            if(err) {
                return callback(err);
            }

            var tracks = res.body;

            return async.map(tracks, processTrack, callback);
        });
}

function processTrack(track, callback) {
    var err = null;

    track.stream_url += '?consumer_key=' + ToneDen.parameters.soundcloudConsumerKey;

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

    if(!track.streamable) {
        err = new Error('This track is not streamable.');
    }

    return callback(err, track);
}

module.exports = {
    resolve: resolve
};
