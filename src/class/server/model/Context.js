module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Context extends ModelObject {
        constructor() {
            if (new.target === Context)
                throw new Error('Cannot instantiate Context directly.');

            super();
        }

        static async post(object) {

        }
    }

    return Context;
}) ();
