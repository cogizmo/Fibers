(function() {
    const PROPS_MAP = new WeakMap();
    class ClassList extends Base {
        constructor(SuperClass) {
            super(...arguments);

            let props = Object.create(null);
            PROPS_MAP.set(this, props);
            
            props.SuperClass = SuperClass;
            props.items = Object.create(null);
        }

        get add(name, ...options) {
            let map = PROPS_MAP.get(this),
                items = map.items,
                SuperClass = map.SuperClass;

            items[name] = (() => {
                return class extends SuperClass {
                    constructor() {
                        super(...arguments);
                    }
                }
            }) ();

        // Add readonly reference to item
            return Object.defineProperty(this, name, {
                get: () => {    return PROPS_MAP.get(this).items[name];   }
            });
        }
    }
}) ();