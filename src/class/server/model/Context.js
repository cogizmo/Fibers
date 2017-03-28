module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Context extends ModelObject {
        constructor() {
            super();
        }

        static async post(object) {

        }
    }

    return Context;
}) ();
