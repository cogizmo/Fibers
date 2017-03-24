"use strict";

(function () {
    const Base = require('../class/Base.js');

    const PROPS = new WeakMap();
    class Application extends Base {
        constructor() {
            super();

        // Set up the Base properties
            let props = new Base();
            PROPS.set(this, props);

        // Bind the application
            let {app} = require('electron');
            props.app = app;
            props.readyPromise = event2Promise(app, 'ready');
        }

        get ready() {
            return PROPS.get(this).readyPromise;
        }

        on() {
            return PROPS.get(this).app.on(...arguments);
        }

        once() {
            return PROPS.get(this).app.on(...arguments);
        }

        quit() {
            return PROPS.get(this).app.quit(...arguments);
        }
    }

    function event2Promise(o, event) {
        return new Promise((y, n) => {
            try {
                o.on(event, () => {
                    y();
                });
            }
            catch (ex) {
                n(ex);
            }
        });
    }

    module.exports = new Application();
}) ();
