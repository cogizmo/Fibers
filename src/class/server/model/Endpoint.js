module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Endpoint extends ModelObject {
        constructor() {
            super();
        }

    }

    return Endpoint;
}) ();
