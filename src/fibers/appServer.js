"use strict";
(function() {
    const __PERSONAL_USE__ = [49152, 65535];
    var excluded = [];

    module.exports = startAppServer;

    async function startAppServer({retries = 5} = {}) {
        const __HTTP__ = require('http');

        let port = await findOpenPort([arguments]);
        console.log('Port found: ' + port);
        if (port === -1)
            throw new Error();
        
        try {
            var server = __HTTP__.createServer();
            server.listen(port, '127.0.53.53', 511, () => {});
        }
        catch(err) {
            console.log(err);
            throw err;
        }
        return server;
    }

    async function findOpenPort({retries = 5, range = __PERSONAL_USE__}) {
        let port,
            open = false,
            attempt = retries;

        while (--attempt >= 0 && open !== true) {
            port = await safeRandom(range);
            open = await isPortOpen(port);
        }
        if (open)
            return port;
        else
            return -1;
    }

    safeRandom.MAX_BYTES = 6;
    safeRandom.MAX_DECIMAL = 281474976710656;
    function safeRandom([min = 0, max = 65535]) {
        var distance = max - min;
        console.log('Min port: ' + min)
        console.log('Max port: ' + max)
        console.log('Distance: ' + distance);

        if (min >= max) {
            throw new TypeError('Minimum number should be less than maximum');
        } else if (distance > safeRandom.MAX_DECIMAL) {
            throw new TypeError('You can not get all possible random numbers if range is greater than 256^6-1');
        } else if (max > Number.MAX_SAFE_INTEGER) {
            throw new TypeError('Maximum number should be safe integer limit');
        } else {
        // To avoid huge mathematical operations and increase function performance for small ranges, you can uncomment following script
            let maxDec = 0,
                maxBytes = 0,
                legal = false;
            while (!legal && (++maxBytes <= safeRandom.MAX_BYTES)) {
                maxDec = Math.pow(256, maxBytes);
                if (distance <= maxDec)
                    legal = true;
            }
            
            if (!legal)
                throw new TypeError('Exceed Max Bytes');

            const __CRYPTO__ = require('crypto');
            var randbytes = parseInt(__CRYPTO__.randomBytes(maxBytes).toString('hex'), 16);
            var result = Math.floor(randbytes / maxDec * (distance + 1) + min);

        // Fast if: ensure max value
            (result > max) && (result = max);
            return result;
        }
    }

    async function isPortOpen(port) {
        return new Promise((y, n) => {
            const __NET__ = require('net');
            let tester = __NET__.createServer()
                .once('error', function (err) {
                    if (err.code != 'EADDRINUSE') 
                        return n('Port is in use');
                })
                .once('listening', function() {
                    tester.once('close', function() { 
                            return y(true);
                        })
                        .close();
                })
                .listen(port)
        });
    }

    /*
    Generating random numbers in specific range using crypto.randomBytes from crypto library
    Maximum available range is 281474976710655 or 256^6-1
    Maximum number for range must be equal or less than Number.MAX_SAFE_INTEGER (usually 9007199254740991)
    Usage examples:
    cryptoRandomNumber(0, 350);
    cryptoRandomNumber(556, 1250425);
    cryptoRandomNumber(0, 281474976710655);
    cryptoRandomNumber((Number.MAX_SAFE_INTEGER-281474976710655), Number.MAX_SAFE_INTEGER);

    Tested and working on 64bit Windows and Unix operation systems.
    */

}) ();
