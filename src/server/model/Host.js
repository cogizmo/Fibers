module.exports = (function defineClass() {
    const instances = new WeakMap();

    const Context = require('./Context.js');
    class Host extends Context {
        constructor(config = {}) {
            super();
            let properties = Object.create(null);
            instances.set(this, properties);

            let {_id, _key, name, hostname} = config;
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
            const Route = require('./Route.js');
            let collection = await database.edgeCollection('ContextRoutes');

            console.log(`Finding routes for: ${this.key}`);
            let edges = await collection.outEdges(instances.get(this).id);
            let routes = await Promise.all(edges.map(async(edge) => {
                let route = await Route.findByID(database, edge._to);
                return route;
            }));
            return routes;
        }
    }

    return Host;
}) ();
