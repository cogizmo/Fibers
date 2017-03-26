module.exports = (function defineClass() {

    const Context = require('./Context.js');
    class Host extends Context {
        constructor() {
            super();
        }

    }

    return Host;
}) ();
