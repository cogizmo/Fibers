module.exports = (function defineClass() {

    const Base = require('../../Base.js');
    class ModelObject extends Base {
        constructor(config = {}) {
            super();

            let {subclass} = config;
            if (!!subclass) {
                let SubClass = require(`./${subclass}.js`);
                return new SubClass(config);
            }
        }

    /**
     * Uses the class identifier to determine the table or collection name.
     *
     * @returns String The name of the table or collection.
     */
        static get table() { return this.name; }

        static async findByKey(database, key) {
            let collection = database.collection(this.table);
            let [doc] = await collection.lookupByKeys([key]);

            let object = new this(doc);
            return object;
        }

        static async getAll(database) {
            let collection = database.collection(this.table);
            let docs = await collection.all();

            let objects = docs.map((v) => {
                return new ModelObject(v);
            });
            return objects;
        }

        get className() {
            return !!this.constructor.name
                ? this.constructor.name
                : '';
        }
    }

    return ModelObject;
}) ();
