(function() {
    const EVENT_MAP = new WeakMap();
    class EventList extends Object {
        constructor() {
            super();
            EVENT_MAP.set(this, Object.create(null));
        }

        add(name, type, defaults) {
        // Get full event list
            let map = EVENT_MAP.get(this);
        // Add event to event list
            map[name] = ((type, defaults) => { 
                return class extends CustomEvent {
                    static get type() {
                        return type;
                    }
                    constructor(detail) {
                        let options = Object.create(null);
                        for (let prop in defaults)
                            options[prop] = defaults[prop];

                        options.detail = detail;
                        super(type, options);
                    }
                }
            }) (type, defaults);

        // Add readonly reference to EventList
            return Object.defineProperty(this, name, {
                get: () => {
                    return EVENT_MAP.get(this)[name];
                }
            });
        }
    }
    window.EventList = EventList;
}) ();