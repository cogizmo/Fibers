module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Handler extends ModelObject {
        constructor() {
            super();
        }

    }

    return Handler;
}) ();
