"use strict";

const Base = require('./Base.js');

const hasOwnProperty = (function() {
    return Function.prototype.call.bind(Object.prototype.hasOwnProperty);
}) ();

class DefaultConfig extends Base {
    constructor() {
        super();
    }

    add(name, value) {
        return Object.defineProperty(this, name, {
            enumerable: true,
            value: value,
            writable: false
        });
    }

    merge(options) {
        let merged = new Base();
        Object.keys(options).forEach((name) => {
            merged[name] = options[name];
        });
        Object.keys(this).forEach((name) => {
            if (!hasOwnProperty(merged, name)) {
                if (!(this[name] instanceof DefaultConfig))
                    merged[name] = this[name];
                else
                    this[name].merge(new Base());
            }
            else if (this[name] instanceof DefaultConfig)
                this[name].merge(merged[name]);
        });
        return merged;
    }
}


module.exports = DefaultConfig;