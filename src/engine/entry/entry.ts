import { MODULE, R } from "module-helpers";

class NodeEntry {
    constructor() {
        const accessors = R.pipe(
            ["key"] as const,
            R.mapToObj((property) => {
                return [
                    property,
                    {
                        value: (this.constructor as typeof NodeEntry)[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    },
                ];
            })
        );

        Object.defineProperties(this, accessors);
    }

    /** must be an unique key */
    static get key(): string {
        throw MODULE.Error("the 'key' static getter must be implemented.");
    }
}

export { NodeEntry };
