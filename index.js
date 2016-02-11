var client = require('./client.js');
var connected = false;
var debug = false;

function log(message) {
    if(debug) {
        console.log(message);
    }
}

client.on('close', function() {
    log('lost connection to the server');
    connected = false;
});

function connect(params) {
    return new Promise(function(resolve, reject) {
        if(connected) {
            log('connection is active, proceeding...');
            resolve();
        } else {
            log('connecting to the server...');
            client.connect(params).then(function() {
                log('connected successfully');
                connected = true;
                resolve();
            }, function(err) {
                log('failed connecting to the server, ' + err.code);
                connected = false;
                reject(err);
            });
        }
    });
}

var spop = {
    /**
     * @param {object} settings Setup parameters
     * @param {string} settings.host Server hostname or ip address
     * @param {number} settings.port Server port number
     * @param {boolean} settings.debug Logs additional information if true
     * @return {Promise}
     */
    setup: function(settings) {
        if(settings.debug) {
            debug = true;
        }

        this.settings = settings;

        return connect(settings);
    },

    /**
     * @description Execute a command on the spop server. Returned promise will be resolved with server's response.
     * @param {string} command Command to be executed on spop server
     * @return {Promise}
     */
    exec: function(command) {
        return new Promise(function(resolve, reject) {
            connect(this.settings)
                .then(function() {
                    log('executing ' + command);
                    client.exec(command)
                        .then(function(res) {
                            resolve(res);
                        }, function(err) {
                            reject(err);
                        });
                }, function(err) {
                    reject(err);
                });
        }.bind(this));
    },

    /**
     * @description Replace the contents of the queue with the given Spotify URI (playlist, track or album only) and start playing
     * @param {string} uri Spotify URI to be played
     * @returns {Promise}
     */
    uplay: function(uri) {
        return this.exec('uplay ' + uri);
    },

    /**
     * @description Add the given Spotify URI to the queue (playlist, track or album only)
     * @param {string} uri Spotify URI to be enqueued
     * @returns {Promise}
     */
    uadd: function(uri) {
        return this.exec('uadd ' + uri);
    },

    /**
     * @description Start playing from the queue
     * @returns {Promise}
     */
    play: function() {
        return this.exec('play');
    },

    /**
     * @description Toggle pause mode
     * @returns {Promise}
     */
    pause: function() {
        return this.exec('pause');
    },

    /**
     * @description Go to position pos in the current track
     * @param pos Position to seek (in miliseconds)
     * @returns {Promise}
     */
    seek: function(pos) {
        return this.exec('seek ' + pos);
    },

    /**
     * @description Toggle repeat mode
     * @returns {Promise}
     */
    repeat: function() {
        return this.exec('repeat');
    },

    /**
     * @description Toggle shuffle mode
     * @returns {Promise}
     */
    shuffle: function() {
        return this.exec('shuffle');
    },

    /**
     * @description Switch to track number tr in the queue
     * @param tr Number of the track
     * @returns {Promise}
     */
    goto: function(tr) {
        return this.exec('goto ' + tr);
    },

    /**
     * @description Switch to the next track in the queue
     * @returns {Promise}
     */
    next: function() {
        return this.exec('next');
    },

    /**
     * @description Switch to the previous track in the queue
     * @returns {Promise}
     */
    prev: function() {
        return this.exec('prev');
    },

    /**
     * @description List the contents of the queue
     * @returns {Promise}
     */
    qls: function() {
        return this.exec('qls');
    },

    /**
     * @description Stop playback
     * @returns {Promise}
     */
    stop: function() {
        return this.exec('stop');
    },

    /**
     * @description Display informations about the queue, the current track, etc.
     * @returns {Promise}
     */
    status: function() {
        return this.exec('status');
    },

    /**
     * @description Disconnect from the server
     * @returns {Promise}
     */
    end: function() {
        return client.end();
    }
};

module.exports = spop;
