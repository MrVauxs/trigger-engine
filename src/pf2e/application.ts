import { TriggerApplication, TriggerApplicationOptions } from "engine";
import { MODULE } from "module-helpers";
import { CreateItemActionNode, TurnEndHook, TurnStartHook } from ".";

function registerPF2eApplication() {
    const options: TriggerApplicationOptions = {
        builtins: true,
        convertors: [],
        entries: [],
        hooks: [TurnEndHook, TurnStartHook],
        nodes: [CreateItemActionNode],
    };

    TriggerApplication.register(MODULE.id, "pf2e-trigger", options);
}

export { registerPF2eApplication };
