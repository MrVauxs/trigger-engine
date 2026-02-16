import { TriggerApplication } from "engine";
import { ActorPF2e, R } from "foundry-helpers";
import { TriggerHook } from ".";

function instantiateHook(parent: TriggerApplication, HookCls: typeof TriggerHook): TriggerHookWrapper {
    function isValidActor(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return !!actor && !actor.pack;
    }

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

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [["isValidActor", isValidActor]] as const,
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

            // from application
            Object.defineProperties(
                this,
                R.fromKeys(
                    [
                        "convertToEmitable",
                        "convertValuesToEmitable",
                        "executeEvent",
                        "executeEventAsGM",
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
