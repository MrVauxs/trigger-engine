import { NodeEntry, TriggerApplication, TriggerEngineRegionBehaviorType, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import { id } from "../module.json";
import { registerPF2eApplication } from "pf2e";

MODULE.register(id, { game: "triggerEngine" });

Hooks.once("init", async () => {
    const args = {
        registerApplication: TriggerApplication.register.bind(TriggerApplication),
    };
    Hooks.callAll("triggerEngine.init", args);

    if (game.system.id === "pf2e") {
        registerPF2eApplication();
    }
});

Hooks.once("setup", async () => {
    CONFIG.RegionBehavior.dataModels[MODULE.path("builtins.region")] = TriggerEngineRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[MODULE.path("builtins.region")] = "fa-solid fa-land-mine-on";

    // prepareTriggers();
    TriggerApplication.prepareApplications();
});

Hooks.once("ready", () => {
    // await prepareModuleTriggers();
    // prepareTriggers();
});

MODULE.apiExpose({
    openBlueprintMenu: TriggerApplication.openBlueprintMenu.bind(TriggerApplication),
});

globalThis.triggerEngine = {
    NodeEntry,
    TriggerHook,
    TriggerNode,
    openBlueprintMenu: TriggerApplication.openBlueprintMenu.bind(TriggerApplication),
};
