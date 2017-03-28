module.exports = (function defineClass() {

    const Route = require('./Route.js');
    class Redirect extends Route {
        constructor() {
            super();
        }

    }

    return Redirect;
}) ();
