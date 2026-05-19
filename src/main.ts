import {
    NodeEntry,
    NodeField,
    TriggerApplication,
    TriggerEngineRegionBehaviorType,
    TriggerHook,
    TriggerNode,
} from "engine";
import { MODULE, R } from "foundry-helpers";
import { PF2eTriggerEngineRegionBehaviorType, registerPF2eApplication } from "pf2e";
import { onUserQuery } from "queries";
import { id } from "../module.json";

MODULE.register(id);

Hooks.once("init", async () => {
    const isPF2eSystem = R.isIncludedIn(game.system.id, ["pf2e", "sf2e"]);

    // we have a different region behavior for pf2e system
    CONFIG.RegionBehavior.dataModels[MODULE.path("builtins.region")] = isPF2eSystem
        ? PF2eTriggerEngineRegionBehaviorType
        : TriggerEngineRegionBehaviorType;

    CONFIG.RegionBehavior.typeIcons[MODULE.path("builtins.region")] = "fa-solid fa-land-mine-on";

    CONFIG.queries[MODULE.path("user-query")] = onUserQuery;

    // we register the pf2e-trigger application
    if (isPF2eSystem) {
        registerPF2eApplication();
    }

    // we allow third party to register their own application
    Hooks.callAll("triggerEngine.registerApplication", TriggerApplication.register.bind(TriggerApplication));

    // we allow third party to register extra nodes for an application
    Hooks.callAll("triggerEngine.registerNodes", TriggerApplication.registerNodes.bind(TriggerApplication));

    // we allow third party to register triggers for a registered application
    Hooks.callAll("triggerEngine.registerTriggers", TriggerApplication.registerTriggers.bind(TriggerApplication));
});

Hooks.once("ready", async () => {
    // we prepare the module triggers
    await TriggerApplication.prepareModulesTriggers();
    // we prepare all the applications once foundry is ready
    TriggerApplication.prepareApplications();
});

MODULE.apiExpose("openBlueprintMenu", TriggerApplication.openBlueprintMenu.bind(TriggerApplication));

globalThis.triggerEngine = {
    NodeEntry,
    NodeField,
    TriggerHook,
    TriggerNode,
};
