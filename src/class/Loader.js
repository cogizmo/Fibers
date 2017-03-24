"use strict";
((global) => {

    const OPTIONS = {
        value: require,
        writable: false,
        enumerable: true,
        configurable: false
    };

    function BaseClass() { }
    BaseClass.prototype = Object.create(null);

    let properties = new WeakMap();
    class ModuleLoader extends BaseClass {
        constructor() {
            super();

            properties.set(this, {});
        }

        import(src) {
            return new Promise((y, n) => {
                let script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.addEventListener('load', (event) => {
                    y(event.currentTarget.exports);
                });
                document.head.appendChild(script);
            });
        }
    }


    Object.defineProperty(global, '_import', OPTIONS);

    let loader = new ModuleLoader();
    function require(module) {
        return loader.import(module);
    }

}) (window || global);
