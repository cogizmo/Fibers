module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Event extends ModelObject {
        constructor() {
            super();
        }

    }

    return Event;
}) ();
