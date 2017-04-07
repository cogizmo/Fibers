module.exports = (function defineClass() {
    const instances = new WeakMap();

    const Route = require('./Route.js');
    class Document extends Route {
        constructor(config = {}) {
            super();
            let properties = Object.create(null);
            instances.set(this, properties);

            let {_id, _key, route, code} = config;
            properties.id = _id;
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
            return instances.get(this).code;
        }
    }

    Object.defineProperty(Document.prototype, 'route', { enumerable: true });
    Object.defineProperty(Document.prototype, 'code', { enumerable: true });

    return Document;
}) ();
