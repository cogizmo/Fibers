module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class Setting extends ModelObject {
        constructor() {
            super();
        }

    }

    return Setting;
}) ();
