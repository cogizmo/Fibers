"use strict";

(function() {

    const properties = new WeakMap();
    const Base = require('../../Base.js');
    const Router = require('./Router.js');
    class HostRouter extends Router {
        constructor() {
            super();

            let props = new Base();
            properties.set(this, props);

            props.routes = new Base();
        }

        get routes() {
            return Object.keys(properties.get(this).routes);
        }

        use(route = '/', router) {
            let {routes} = properties.get(this);
            if (routes[route])
                routes[route].push(router);
            else routes[route] = [router];
        }

        async route(request, response) {
            let {headers, method} = request,
                {host} = headers,
            // host = hostname:port
                [hostname] = host.split(':');

            let {routes} = properties.get(this);
            let [actualHost] = getValidHosts(hostname, routes);

            if (!actualHost) {
                console.log(`Host not found: ${actualHost}`);

            }
            //console.log(`Request from: ${actualHost} at ${request.url}`);

            let handlers = routes[actualHost];
            handlers.forEach(forward(request, response));
        }
    }

    module.exports = HostRouter;

    function getValidHosts(hostname, routes) {
        return Object.keys(routes).filter(isEqualTo(hostname));
    }

    function isEqualTo(value) {
        return (v, k, a) => {
            return value === v;
        };
    }

    function forward() {
        return (handler) => {
            if (typeof handler === 'function') {
                handler(...arguments);
            }
            else if (typeof handler.route === 'object') {
                handler.route(...arguments);
            }
        };
    }
}) ()
