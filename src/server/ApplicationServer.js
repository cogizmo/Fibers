"use strict";

module.exports = (function() {
    const __PERSONAL_USE__ = [49152, 65535];

    const Base = require('../class/Base.js');
    const __PROPS__ = new WeakMap();
    class ApplicationServer extends Base {
        constructor(router) {
            super();

            let props = new Base();
            __PROPS__.set(this, props);

            let http = require('http');
            props.server = http.createServer(router);
        }

        get address() {
            return __PROPS__.get(this).server.address();
        }

        async listen() {
            let server = __PROPS__.get(this).server;
            return new Promise((y, n) => {
                try {
                server.once('listening', () => {
                        console.log('Remote Server started on: ' + server.address().address + ':' + server.address().port);
                        y(server);
                    })
                    .once('error', function (err) {
                        if (err.code != 'EADDRINUSE')
                            return n('Port is in use');
                        return n(err);
                    })
                server.listen(...arguments);

            }
            catch (ex) {
                console.log(ex);
                throw ex;
            }
            });
        }

        close() {
            let server = __PROPS__.get(this).server;
            return new Promise((y, n) => {
                try {
                    console.log('Adding Listener...')
                    server.on('close', () => {
                        console.log('Resolving...')
                        y(true);
                    });
                    console.log('Closing...')
                    server.close(...arguments);
                }
                catch(ex) {
                    console.log(ex);
                    throw ex;
                }
            });
        }

        static async findPort({retries = 5, range = __PERSONAL_USE__} = {}) {
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

    return ApplicationServer;
}) ();
