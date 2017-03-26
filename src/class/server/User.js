module.exports = (function defineClass() {

    const FObject = require('./Object.js');
    class User extends FObject {
        constructor() {
            super();
        }

    }

    return User;
}) ();
