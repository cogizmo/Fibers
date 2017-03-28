module.exports = (function defineClass() {
    const instances = new WeakMap();

    const Route = require('./Route.js');
    class StaticRoute extends Route {
        constructor(config = {}) {
            super();

            let {_key, route, path} = config;
            console.log(config);
            let properties = Object.create(null);
            instances.set(this, properties);

            properties.key = _key;
            properties.subclass = this.className;
            properties.route = route;
            properties.path = path;
        }

        get key() {
            return instances.get(this).key;
        }

        get route() {
            return instances.get(this).route;
        }

        get path() {
            return instances.get(this).path;
        }
    }

    return StaticRoute;
}) ();
