import { Trigger } from "engine";
import { TriggerHook } from ".";

function registerHooks(moduleId: string, ...hooks: TriggerHook[]) {}

function prepareHooks(triggers: Trigger[]) {
    console.log(triggers);
}

export { prepareHooks, registerHooks };
