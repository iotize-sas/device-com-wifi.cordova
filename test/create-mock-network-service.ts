// TODO create mock network service to test network service discovery
var bonjour = require('bonjour')()

var count = 0;

let tapM2MBrowser = bonjour.find({ type: 'tapm2m' }, function (service: any) {
    console.log(`${++count})`, 'Found an tapm2m server:', service)
})

setTimeout(() => {
    // advertise an HTTP server on port 3000
    bonjour.publish({ name: 'Test Tap', type: 'tapm2m', port: 2000, protocol: 'tcp' })
}, 300);
