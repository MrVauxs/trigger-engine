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

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [["executeEvent", this.#executeEvent]] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    }),
                ),
            );
        }

        #executeEvent(event: string, args?: unknown) {
            parent.executeEvent(event, args);
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
