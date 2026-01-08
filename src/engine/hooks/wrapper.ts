import { TriggerApplication } from "engine";
import { R } from "module-helpers";
import { TriggerHook } from ".";

function instantiateHook(parent: TriggerApplication, HookCls: typeof TriggerHook): TriggerHookWrapper {
    class TriggerHookWrapper extends HookCls {
        constructor() {
            super();

            Object.defineProperties(this, {
                name: {
                    value: HookCls.name,
                    configurable: false,
                    enumerable: true,
                    writable: false,
                },
            });

            // some properties
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["name", HookCls.name],
                        ["applicationKey", parent.applicationKey],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((value) => {
                        return {
                            value,
                            configurable: false,
                            enumerable: true,
                            writable: false,
                        };
                    }),
                ),
            );

            // from application
            Object.defineProperties(
                this,
                R.fromKeys(
                    [
                        "executeEvent",
                        "executeTriggerEvent",
                        "executeTriggerEventAsGM",
                        "parseUserValue",
                        "parseUserValues",
                    ] as const,
                    (property) => {
                        return {
                            value: parent[property].bind(parent),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    },
                ),
            );
        }
    }

    interface TriggerHookWrapper {
        readonly name: string;
    }

    return new TriggerHookWrapper();
}

interface TriggerHookWrapper extends TriggerHook {
    readonly name: string;
}

export { instantiateHook };
export type { TriggerHookWrapper };
