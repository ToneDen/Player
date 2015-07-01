module.exports = {
    PlayerInstanceStore: new (require('./PlayerInstanceStore'))(),
    TrackQueueStore: new (require('./TrackQueueStore'))(),
    TrackStore: new (require('./TrackStore'))()
};
