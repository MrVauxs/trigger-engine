import { TriggerApplication, TriggerApplicationOptions } from "engine";
import { MODULE } from "module-helpers";
import { pf2eConvertors, pf2eEntries } from ".";
import hooks from "./hooks";
import nodes from "./nodes";

function registerPF2eApplication() {
    const options: TriggerApplicationOptions = {
        builtins: true,
        convertors: pf2eConvertors,
        entries: pf2eEntries as any,
        hooks,
        nodes,
    };

    TriggerApplication.register(MODULE.id, "pf2e-trigger", options);
}

export { registerPF2eApplication };
