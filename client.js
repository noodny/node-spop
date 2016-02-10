var events = require('events');
var net = require('net');
var util = require('util');

var instance = null;

function Client() {
    events.EventEmitter.call(this);
}

util.inherits(Client, events.EventEmitter);

Client.prototype.connect = function(params) {
    params.host = params.host || '127.0.0.1';
    params.port = params.port || 23;

    if(!this.socket) {
        this.socket = new net.Socket();

        this.socket.on('close', this.emit.bind(this, 'socketClose'));
        this.socket.on('connect', this.emit.bind(this, 'socketConnect'));
        this.socket.on('end', this.emit.bind(this, 'socketEnd'));
        this.socket.on('timeout', function() {
            this.close();
        }.bind(this));

        this.socket.on('data', function(chunk) {
            this.lastChunk = chunk;
            this.emit('socketData', chunk);
        }.bind(this));

        this.socket.on('error', function(error) {
            this.lastError = error;
            this.emit('socketError', error);
        }.bind(this));
    }

    return new Promise(function(resolve, reject) {
        this.once('socketConnect', function() {
            this.once('socketData', resolve);
        }.bind(this));
        this.once('socketClose', function(withError) {
            reject(withError ? this.lastError : null);
        });

        this.socket.connect({
            port: params.port,
            host: params.host
        });
    }.bind(this));
};

Client.prototype.end = function() {
    return new Promise(function(resolve, reject) {
        this.once('socketClose', resolve);

        this.socket.end();
    }.bind(this));
};

Client.prototype.exec = function(command) {
    return new Promise(function(resolve, reject) {
        var responseString = '',
            responseTimeout;

        function onSocketDataEnd() {
            var responseJSON;

            this.removeAllListeners('socketData');

            if(responseString.length) {
                try {
                    responseJSON = JSON.parse(responseString);
                } catch (e) {
                }
            }

            if(responseJSON) {
                if(responseJSON.error) {
                    return reject(responseJSON.error);
                }

                resolve(responseJSON);
            } else {
                resolve(responseString);
            }
        }

        function onSocketData(chunk) {
            if(responseTimeout) {
                clearTimeout(responseTimeout);
            }

            var stringData = chunk.toString();

            if(typeof stringData === 'string' && stringData.length) {
                responseString += stringData;
            }

            // wait 50s for the next response chunk in case of chunked responses
            responseTimeout = setTimeout(onSocketDataEnd.bind(this), 50);
        }

        this.on('socketData', onSocketData);
        this.once('socketError', function(error) {
            reject(error);
        }.bind(this));

        this.socket.write(command + '\n');
    }.bind(this));
};

module.exports = function() {
    if(!instance) {
        instance = new Client();
    }

    return instance;
}();
