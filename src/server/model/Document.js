module.exports = (function defineClass() {

    const Route = require('./Route.js');
    class Document extends Route {
        constructor(config = {}) {
            super();

            let {_key, route, code} = config;
            console.log(config);
            let properties = Object.create(null);
            instances.set(this, properties);

            properties.key = _key;
            properties.subclass = this.className;
            properties.route = route;
            properties.code = code;
        }

        get key() {
            return instances.get(this).key;
        }

        get route() {
            return instances.get(this).route;
        }

        get code() {
            return instances.get(this).path;
        }
    }

    return Document;
}) ();
