"use strict";
/**
 * Module dependencies.
 * @private
 */

var debug = require('debug')('connect:dispatcher');
var finalhandler = require('finalhandler');
var http = require('http');
var merge = require('utils-merge');
var parseUrl = require('parseurl');

module.exports = (function() {
    const TRAILING_SLASHES = /\/+$/;
    /**
     * Module variables.
     * @private
     */

    var env = process.env.NODE_ENV || 'development';

    /* istanbul ignore next */
    var defer = typeof setImmediate === 'function'
        ? setImmediate
        : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

    let internals = new WeakMap();

    const EventEmitter = require('events').EventEmitter;
    class ConnectRouter extends EventEmitter {
        constructor() {
            super();

            let props = Object.create(null);
            internals.set(this, props);

            props.route = '/';
            props.stack = [];
        }

        get route() {
            return internals.get(this).route;
        }

        get stack() {
            return internals.get(this).stack;
        }

        /**
         * Utilize the given middleware `handle` to the given `route`,
         * defaulting to _/_. This "route" is the mount-point for the
         * middleware, when given a value other than _/_ the middleware
         * is only effective when that segment is present in the request's
         * pathname.
         *
         * For example if we were to mount a function at _/admin_, it would
         * be invoked on _/admin_, and _/admin/settings_, however it would
         * not be invoked for _/_, or _/posts_.
         *
         * @param {String|Function|Server} route, callback or server
         * @param {Function|Server} callback or server
         * @return {Server} for chaining
         * @public
         */
        use(route, fn) {
            var handle = fn;
            var path = route;

            // default route to '/'
            if (typeof route !== 'string') {
                handle = route;
                path = '/';
            }

            // wrap sub-apps
            if (typeof handle.handle === 'function') {
                let server = handle;
                server.route = path;
                handle = function (req, res, next) {
                    server.handle(req, res, next);
                };
            }

            // wrap vanilla http.Servers
            if (handle instanceof http.Server) {
                handle = handle.listeners('request')[0];
            }

            // strip trailing slash
            path = path.replace(TRAILING_SLASH, '');

            // add the middleware
            debug('use %s %s', path || '/', handle.name || 'anonymous');
            this.stack.push({ route: path, handle: handle });

            return this;
        }

        /**
         * Handle server requests, punting them down the middleware stack.
         *
         * @private
         */
        handle(req, res, out) {
            var protohost = getProtohost(req.url) || '';

            var slashAdded = false;

            // final function handler
            var done = out || finalhandler(req, res, {
                env: env,
                onerror: logerror
            });

            // store the original URL
            req.originalUrl = req.originalUrl || req.url;

            let index = 0;
            let removed = '';
            let next = (err) => {

                if (slashAdded) {
                    req.url = req.url.substr(1);
                    slashAdded = false;
                }

                if (removed.length !== 0) {
                    req.url = protohost + removed + req.url.substr(protohost.length);
                    removed = '';
                }

                // next callback
                let layer = this.stack[index++];

                // all done
                if (!layer) {
                    defer(done, err);
                    return;
                }

                // route data
                var path = parseUrl(req).pathname || '/';
                var route = layer.route;

                // skip this layer if the route doesn't match
                if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
                    return next(err);
                }

                // skip if route match does not border "/", ".", or end
                var c = path[route.length];
                if (c !== undefined && '/' !== c && '.' !== c) {
                    return next(err);
                }

                // trim off the part of the url that matches the route
                if (route.length !== 0 && route !== '/') {
                    removed = route;
                    req.url = protohost + req.url.substr(protohost.length + removed.length);

                    // ensure leading slash
                    if (!protohost && req.url[0] !== '/') {
                        req.url = '/' + req.url;
                        slashAdded = true;
                    }
                }

                // call the layer handle
                call(layer.handle, route, err, req, res, next);
            }

            next();
        };

        /**
         * Listen for connections.
         *
         * This method takes the same arguments
         * as node's `http.Server#listen()`.
         *
         * HTTP and HTTPS:
         *
         * If you run your application both as HTTP
         * and HTTPS you may wrap them individually,
         * since your Connect "server" is really just
         * a JavaScript `Function`.
         *
         *      var connect = require('connect')
         *        , http = require('http')
         *        , https = require('https');
         *
         *      var app = connect();
         *
         *      http.createServer(app).listen(80);
         *      https.createServer(options, app).listen(443);
         *
         * @return {http.Server}
         * @api public
         */
        listen() {
            var server = http.createServer(this.handle.bind(this));
            return server.listen.apply(server, arguments);
        };
    }

    return ConnectRouter;

    /**
     * Get get protocol + host for a URL.
     *
     * @param {string} url
     * @private
     */
    function getProtohost(url) {
        if (url.length === 0 || url[0] === '/') {
            return undefined;
        }

        var searchIndex = url.indexOf('?');
        var pathLength = searchIndex !== -1
            ? searchIndex
            : url.length;
        var fqdnIndex = url.substr(0, pathLength).indexOf('://');

        return fqdnIndex !== -1
            ? url.substr(0, url.indexOf('/', 3 + fqdnIndex))
            : undefined;
    }


    /**
     * Invoke a route handle.
     * @private
     */
    function call(handle, route, err, req, res, next) {
        debug('%s %s : %s', handle.name || '<anonymous>', route, req.originalUrl);

        var error = err;

        try {
            let arity = handle.length;
            let hasError = Boolean(err);
            if (hasError && arity === 4) {
                // error-handling middleware
                handle(err, req, res, next);
                return;
            } else if (!hasError && arity < 4) {
                // request-handling middleware
                handle(req, res, next);
                return;
            }
        } catch (e) {
            // replace the error
            error = e;
        }

        // continue
        next(error);
    }

    /**
     * Log error using console.error.
     *
     * @param {Error} err
     * @private
     */
    function logerror(err) {
        if (env !== 'test')
            console.error(err.stack || err.toString());
    }

}) ();
