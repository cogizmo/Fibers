module.exports = (function defineClass() {

    const Setting = require('./Setting.js');
    class UserSetting extends Setting {
        constructor() {
            super();
        }

    }

    return UserSetting;
}) ();
