module.exports = (function defineClass() {

    const ModelObject = require('./ModelObject.js');
    class User extends ModelObject {
        constructor() {
            super();
        }

    }

    return User;
}) ();
