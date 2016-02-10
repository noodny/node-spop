var client = require('./../client.js');

client.connect({
    host: '0.tcp.ngrok.io',
    port: '14364'
}).then(function() {
    console.log('connected');

    return client.exec('play').then(function(res) {
        console.log('executed command "play", response: \n', res);
    }, function(err) {
        console.log('failed executing command');
    });
}, function(error) {
    console.log('not connected', error);
}).then(function() {
    return client.exec('status').then(function(res) {
        console.log('executed command "status", response: \n', res);
    })
}).then(function() {
    console.log('closing connection');
    client.end();
});
