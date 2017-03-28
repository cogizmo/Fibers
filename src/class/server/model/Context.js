module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Context extends ModelObject {
        constructor(config) {
            super();

            console.log(config);
        }

        static async post(object) {

        }
    }

    return Context;
}) ();
