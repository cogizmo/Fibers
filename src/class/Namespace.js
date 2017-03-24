"use strict";

const Base = require('./Base.js');
class Namespace extends Base {
    constructor(options) {
        super();
    }

    static get DEFAULTS() {
        return {
            config: {
                conventions: {
                    contants: 'uppercase',
                    namespaces: {
                        case: 'studlycase',
                    },
                    variables: 'camelcase',
                    methods: 'camelcase',
                    functions: {
                        case: 'camelcase',
                    },
                },
            },
        };
    }

    get constants() {

    }
    addConstant(value, name) {
        return Object.defineProperty(this, name, {
            value: value,
            writable: false,
            enumerable: true
        });
    }

    get namespaces() {

    }
    addNamespace(namespace, name = '') {
        return this;
    }

    get classes() {

    }
    addClass(Class, name = '') {
        if (typeof name === 'string' && !!name)
            this[name] = Class;
        else this[Class.name] = Class;

        return this;
    }
}

function exposeValue(name, value) {
    this[name] = value;
    return this;
}

module.exports = Namespace;