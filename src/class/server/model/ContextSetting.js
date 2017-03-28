module.exports = (function defineClass() {

    const Setting = require('./Setting.js');
    class ContextSetting extends Setting {
        constructor() {
            super();
        }

    }

    return ContextSetting;
}) ();
