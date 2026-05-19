import { TriggerApplication, TriggerApplicationOptions } from "engine";
import { localize, MODULE, SYSTEM } from "foundry-helpers";
import { pf2eConvertors, pf2eEntries } from ".";
import hooks from "./hooks";
import nodes from "./nodes";

const VERSION = {
    pf2e: "8.1.2",
    sf2e: "1.1.2",
};

function registerPF2eApplication() {
    const requiredVersion = VERSION[SYSTEM.id];
    if (foundry.utils.isNewerVersion(requiredVersion, game.system.version)) {
        if (game.user.isGM) {
            localize.error("pf2e-trigger.version.error", { version: requiredVersion });
        }
        return;
    }

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
