"use strict";

// Make sure to add mime as a dependency...
// npm install mime;
// module.exports.mime = send.mime
(function() {
    var parseUrl = require('parseurl');

    const internals = new WeakMap();

    const Router = require('./Router.js');
    class StaticRouter extends Router {
        constructor(root, options) {
            if (!root) {
                throw new TypeError('root path required');
            }

            if (typeof root !== 'string') {
                throw new TypeError('root path must be a string');
            }

            super();

            const Base = require('../../class/Base.js');
            let props = new Base();
            internals.set(this, props);

            // copy options object
            let resolve = require('path').resolve;
            props.root = resolve(root);

            props.fallthrough = options.fallthrough !== false;
            props.redirect = options.redirect !== false;
            props.maxage = options.maxage || options.maxAge || 0;
            props.setHeaders = options.setHeaders;
            if (typeof props.setHeaders !== 'undefined'
            &&  typeof props.setHeaders !== 'function') {
                throw new TypeError('option setHeaders must be function');
            }
        }

        use(route = '/', router) {
            let {routes} = instances.get(this);
            if (routes[route])
                routes[route].push(router);
            else routes[route] = [router];
        }

        async route(request, response, next) {
            let options = internals.get(this);
            let {fallthrough} = options;

            if (request.method !== 'GET' && request.method !== 'HEAD') {
                if (fallthrough) {
                    return next();
                }

                // method not allowed
                response.statusCode = 405;
                response.setHeader('Allow', 'GET, HEAD');
                response.setHeader('Content-Length', '0');
                response.end();
                return;
            }

            var originalUrl = parseUrl.original(request);
            var path = parseUrl(request).pathname;

            // make sure redirect occurs at mount
            if (path === '/' && originalUrl.pathname.substr(-1) !== '/') {
                path = '';
            }

            // create send stream
            const send = require('send');
            let stream = send(request, path, options);

            // add directory handler
            let onDirectory = options.redirect ? onRedirect : onNotFound;
            stream.on('directory', onDirectory);

            // add headers listener
            if (options.setHeaders) {
                stream.on('headers', options.setHeaders);
            }

            // add file listener for fallthrough
            let forwardError = !fallthrough;
            if (fallthrough) {
                stream.on('file', function onFile () {
                    // once file is determined, always forward error
                    forwardError = true;
                });
            }

            // forward errors
            stream.on('error', function error (err) {
                if (forwardError || !(err.statusCode < 500)) {
                    next(err);
                    return;
                }

                next();
            });

            // pipe
            stream.pipe(res);
        }
    }

    module.exports = StaticRouter;

    /**
     * Create a directory listener that just 404s.
     * @private
     */
    function onNotFound() {
        this.error(404);
    };

    /**
     * Create a directory listener that performs a redirect.
     * @private
     */

    function onRedirect(response) {
        if (this.hasTrailingSlash()) {
            this.error(404);
            return;
        }

        // get original URL
        var originalUrl = parseUrl.original(this.req);

        // append trailing slash
        originalUrl.path = null;
        originalUrl.pathname = collapseLeadingSlashes(originalUrl.pathname + '/');

        // reformat the URL
        const url = require('url');
        const encodeUrl = require('encodeurl');
        var loc = encodeUrl(url.format(originalUrl));

        const escapeHtml = require('escape-html');
        var doc = createHtmlDocument('Redirecting', 'Redirecting to <a href="' + escapeHtml(loc) + '">' +
        escapeHtml(loc) + '</a>');

        // send redirect response
        response.statusCode = 301;
        response.setHeader('Content-Type', 'text/html; charset=UTF-8');
        response.setHeader('Content-Length', Buffer.byteLength(doc));
        response.setHeader('Content-Security-Policy', "default-src 'self'");
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('Location', loc);
        response.end(doc);
    }

    /**
     * Collapse all leading slashes into a single slash
     * @private
     */
    function collapseLeadingSlashes(str) {
        for (var i = 0; i < str.length; i++) {
            if (str[i] !== '/') {
                break;
            }
        }

        return i > 1
            ? '/' + str.substr(i)
            : str;
    }

    /**
     * Create a minimal HTML document.
     *
     * @param {string} title
     * @param {string} body
     * @private
     */
    function createHtmlDocument(title, body) {
        return '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head>\n' +
            '<meta charset="utf-8">\n' +
            '<title>' + title + '</title>\n' +
            '</head>\n' +
            '<body>\n' +
            '<pre>' + body + '</pre>\n' +
            '</body>\n';
    }

}) ();
