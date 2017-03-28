module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Namespace extends ModelObject {
        constructor() {
            super();
        }

    }

    return Namespace;
}) ();
