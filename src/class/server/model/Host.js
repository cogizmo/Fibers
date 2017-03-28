module.exports = (function defineClass() {
    const instances = new WeakMap();

    const Context = require('./Context.js');
    class Host extends Context {
        constructor(config = {}) {
            super();

            let {_id, _key, name, hostname} = config;

            let properties = Object.create(null);
            instances.set(this, properties);

            properties.id = _id;
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

        async getRoutes(database) {
            const Endpoint = require('./Endpoint.js');
            let collection = await database.edgeCollection('ContextEndpoints');

            console.log(`Finding routes for: ${this.key}`);
            let edges = await collection.outEdges(instances.get(this).id);
            let endpoints = await Promise.all(edges.map(async(edge) => {
                let endpoint = await Endpoint.findByID(database, edge._to);
                return endpoint;
            }));
            return endpoints;
        }
    }

    return Host;
}) ();
