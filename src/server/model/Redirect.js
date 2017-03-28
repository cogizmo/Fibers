module.exports = (function defineClass() {

    const Endpoint = require('./Endpoint.js');
    class Redirect extends Endpoint {
        constructor() {
            super();
        }

    }

    return Redirect;
}) ();
