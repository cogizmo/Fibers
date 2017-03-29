"use strict";

(function() {

    const instances = new WeakMap();
    const Base = require('../../class/Base.js');
    const Router = require('./Router.js');
    class HostRouter extends Router {
        constructor() {
            super();

            let props = new Base();
            instances.set(this, props);

            props.routes = new Base();
        }

        get routes() {
            return Object.keys(instances.get(this).routes);
        }

        use(route = '/', router) {
            let {routes} = instances.get(this);
            if (routes[route])
                routes[route].push(router);
            else routes[route] = [router];
        }

        async route(request, response) {
            let {headers, method} = request,
                {host} = headers,
            // host = hostname:port
                [hostname] = host.split(':');

            let {routes} = instances.get(this);
            let [actualHost] = getValidHosts(hostname, routes);

            if (!actualHost) {
                console.log(`Host not found: ${actualHost}`);

            }
            //console.log(`Request from: ${actualHost} at ${request.url}`);

            let handlers = routes[actualHost];
            handlers.forEach(forward(request, response));
        }

        getRouter(hostname) {
            return instances.get(this).routes[hostname];
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
