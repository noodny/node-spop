var spop = require('./../index.js');

spop.setup({
    host: '0.tcp.ngrok.io',
    port: '14364',
    debug: false
}).then(function() {
    console.log('executing "status 1"...');
    return spop.status();
}).then(function(res) {
    console.log('got "status 1" results, ', res);
    console.log('executing "stop 1"...');
    return spop.stop()
}).then(function(res) {
    console.log('got "stop 1" results', res);
    console.log('executing "uplay"...');
    return spop.uplay('spotify:user:spotify:playlist:5j9qtb8iLfNoQh2b0Ve11m');
}).then(function(res) {
    console.log('got "uplay" results', res);
    console.log('executing "stop 2" in 5 seconds...');
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            console.log('executing "stop 2"...');
            spop.stop().then(resolve, reject);
        }, 5000);
    });
}).then(function(res) {
    console.log('got "stop 2" results', res);
    console.log('executing "status 2"...');
    return spop.status();
}).then(function(res) {
    console.log('got "status 2" results, ', res);
    console.log('executing "qls"...');
    return spop.qls();
}).then(function(res) {
    console.log('got "qls" results, ', res);
    console.log('executing "end"...');
    spop.end();
});


