"use strict";

const {BrowserWindow} = require('electron');
class SplashWindow extends BrowserWindow {

    constructor(options) {
        //options.resizable = false;
        //options.frame = false;
        options.webPreferences = {
            //devTools: false,
            allowRunningInsecureContent: false,
            allowDisplayingInsecureContent: false,
        };

        super(options);
    }

}

module.exports = SplashWindow;