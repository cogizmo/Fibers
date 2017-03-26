module.exports = (function defineClass() {

    const Endpoint = require('./Endpoint.js');
    class Page extends Endpoint {
        constructor() {
            super();
        }

    }

    return Page;
}) ();
