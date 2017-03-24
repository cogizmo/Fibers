"use strict";
((module) => {

    function BaseClass() {  }
    BaseClass.prototype = Object.create(null);

    class Base extends BaseClass {
        constructor() {
            super();
        }
    }

// Support Browsers    
    if (module)
        module.exports = Base;
    else
        window.Base = Base;
        
// Support Modules
}) (module || document.currentScript);
