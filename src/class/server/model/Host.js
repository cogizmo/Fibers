module.exports = (function defineClass() {

    const Context = require('./Context.js');
    class Host extends Context {
        constructor() {
            super();
        }

        static get table() { return super.table; }
    }

    return Host;
}) ();
