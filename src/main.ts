import { NodeEntry, TriggerApplication, TriggerEngineRegionBehaviorType, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import { registerPF2eApplication } from "pf2e";
import { onUserQuery } from "queries";
import { id } from "../module.json";

MODULE.register(id, { game: "triggerEngine" });

Hooks.once("init", async () => {
    CONFIG.RegionBehavior.dataModels[MODULE.path("builtins.region")] = TriggerEngineRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[MODULE.path("builtins.region")] = "fa-solid fa-land-mine-on";

    CONFIG.queries[MODULE.path("user-query")] = onUserQuery;

    // we allow third party modules to register their own application
    Hooks.callAll("triggerEngine.registerApplication", TriggerApplication.register.bind(TriggerApplication));

    // we register the pf2e-trigger application
    if (game.system.id === "pf2e") {
        registerPF2eApplication();
    }

    // we prepare all the applications
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
