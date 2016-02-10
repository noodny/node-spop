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
    if(params.debug) {
        debug = true;
    }
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
    setup: function(settings) {
        this.settings = settings;

        return connect(settings);
    },

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

    uplay: function(uri) {
        return this.exec('uplay ' + uri);
    },

    uadd: function(uri) {
        return this.exec('uadd ' + uri);
    },

    play: function() {
        return this.exec('play');
    },

    pause: function() {
        return this.exec('pause');
    },

    seek: function(pos) {
        return this.exec('seek ' + pos);
    },

    repeat: function() {
        return this.exec('repeat');
    },

    shuffle: function() {
        return this.exec('shuffle');
    },

    goto: function(tr) {
        return this.exec('goto ' + tr);
    },

    next: function() {
        return this.exec('next');
    },

    prev: function() {
        return this.exec('prev');
    },

    qls: function() {
        return this.exec('qls');
    },

    stop: function() {
        return this.exec('stop');
    },

    status: function() {
        return this.exec('status');
    },

    end: function() {
        return client.end();
    }
};

module.exports = spop;
