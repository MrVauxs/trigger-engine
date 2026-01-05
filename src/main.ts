import { NodeEntry, TriggerApplication, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import { id } from "../module.json";

MODULE.register(id, { game: "triggerEngine" });

Hooks.once("init", async () => {
    const args = {
        registerApplication: TriggerApplication.register.bind(TriggerApplication),
    };
    Hooks.callAll("triggerEngine.init", args);
});

Hooks.once("setup", async () => {
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
