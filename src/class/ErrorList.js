(function() {

    const ERROR_MAP = new WeakMap();
    class ErrorList extends Object {
        constructor() {
            super();
            ERROR_MAP.set(this, Object.create(null));
        }

        add(key, ErrorClass, templateString) {
        // Get full event list
            let map = ERROR_MAP.get(this);
            
            function templatize() {
                return eval('return `'+templateString+'`')
            }
        // Add event to event list
            map[name] = ((ErrorClass, template) => {
                return () => {
                    return new error(template);
                };
            }) (ErrorClass, templatize(templateString));

        // Add readonly reference to EventList
            return Object.defineProperty(this, name, {
                get: () => {
                    return ERROR_MAP.get(this)[name];
                }
            });
        }
    }
    window.ErrorList = ErrorList;
}) ();