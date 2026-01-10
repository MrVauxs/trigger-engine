import { TriggerApplication, TriggerApplicationOptions } from "engine";
import { MODULE } from "module-helpers";
import { CreateItemActionNode } from ".";

function registerPF2eApplication() {
    const options: TriggerApplicationOptions = {
        builtins: true,
        convertors: [],
        entries: [],
        hooks: [],
        nodes: [CreateItemActionNode],
    };

    TriggerApplication.register(MODULE.id, "pf2e-trigger", options);
}

export { registerPF2eApplication };
