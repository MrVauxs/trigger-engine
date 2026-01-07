import { NodeEntry, TriggerApplication, TriggerEngineRegionBehaviorType, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import { id } from "../module.json";
import { registerPF2eApplication } from "pf2e";

MODULE.register(id, { game: "triggerEngine" });

Hooks.once("init", async () => {
    CONFIG.RegionBehavior.dataModels[MODULE.path("builtins.region")] = TriggerEngineRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[MODULE.path("builtins.region")] = "fa-solid fa-land-mine-on";

    Hooks.callAll("triggerEngine.init", {
        registerApplication: TriggerApplication.register.bind(TriggerApplication),
    });

    if (game.system.id === "pf2e") {
        registerPF2eApplication();
    }

    TriggerApplication.prepareApplications();
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
