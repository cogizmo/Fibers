module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Variable extends ModelObject {
        constructor() {
            super();
        }

    }

    return Variable;
}) ();
