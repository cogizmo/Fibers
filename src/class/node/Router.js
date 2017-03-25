"use strict";

(function() {

    const properties = new WeakMap();
    const Base = require('../Base.js');
    class Router extends Base {
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

            routes[route].push(router);
        }

        async route(request, response) {
            let {routes} = properties.get(this);
            let validRoutes = getValidRoutes(request.path, routes);

            validRoutes.forEach((v, k, a) => {
                let handler = routes[v];
                if (typeof handler === 'function')
                    handler(request, response);
                else if (typeof handler.route === 'function')
                    handler.route(request, response);
            })
        }
    }

    module.exports = Router;
    
    function getValidRoutes(path, routes) {
        return Object.keys(routes).filter((v, k, a) => {
            return path.startsWith(v);
        })
    }
}) ()