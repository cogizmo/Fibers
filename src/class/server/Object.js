module.exports = (function defineClass() {

    const Base = require('../Base.js');
    class Object extends Base {
        constructor() {
            super();
        }

        className() {
            return !!this.constructor.name
                ? this.constructor.name
                : '';
        }
    }

    return Object;
}) ();
