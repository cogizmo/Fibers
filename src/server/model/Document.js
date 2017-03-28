module.exports = (function defineClass() {

    const Route = require('./Route.js');
    class Page extends Route {
        constructor() {
            super();
        }

    }

    return Page;
}) ();
