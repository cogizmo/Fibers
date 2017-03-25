"use strict";

const {BrowserWindow} = require('electron');
const DefaultConfig = require('../DefaultConfig.js');

const __PROPS__ = new WeakMap();
class AsyncWindow extends BrowserWindow {

    constructor(opts) {
        let options = typeof opts === 'object'
            ? opts
            : Object.create(null);
        let config = AsyncWindow.OPTIONS.merge(options);
        super(config);

        let props = Object.create(null);
        __PROPS__.set(this, props);
    }

    static get OPTIONS() {
        return __DEFAULTS__;
    }

    readyForFun() {
        
    }
}

const __DEFAULTS__ = new DefaultConfig()
    .add('frame', true)
    .add('resizable', true)
    .add('webPreferences', new DefaultConfig()
        .add('devTools', true)
        .add('allowRunningInsecureContent', false)
        .add('allowDisplayingInsecureContent', false)
    );

module.exports = AsyncWindow;