module.exports = (function defineClass() {
    const instances = new WeakMap();

    const Context = require('./Context.js');
    class Host extends Context {
        constructor(config = {}) {
            super();

            let {_key, name, hostname} = config;

            let properties = Object.create(null);
            instances.set(this, properties);

            properties.key = _key;
            properties.subclass = this.className;
            properties.name = name;
            properties.hostname = hostname;
        }

        static get table() { return super.table; }

        get key() {
            return instances.get(this).key;
        }

        get name() {
            return instances.get(this).name;
        }

        get hostname() {
            return instances.get(this).hostname;
        }

        async save() {
            return JSON.stringify(instances.get(this));
        }
    }

    return Host;
}) ();
