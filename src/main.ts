import {
    NodeEntry,
    openBlueprintMenu,
    registerApplication,
    TriggerHook,
    TriggerNode,
} from "engine";
import { MODULE, z } from "module-helpers";

MODULE.register("trigger-engine", { game: "triggerEngine" });

Hooks.once("init", async () => {
    Hooks.callAll("triggerEngine.init", { registerApplication });
});

Hooks.once("setup", async () => {
    // await prepareModuleTriggers();
    // prepareTriggers();
});

Hooks.once("ready", () => {
    // await prepareModuleTriggers();
    // prepareTriggers();
});

MODULE.apiExpose({
    openBlueprintMenu,
});

globalThis.triggerEngine = {
    NodeEntry,
    TriggerHook,
    TriggerNode,
    openBlueprintMenu,
};

globalThis.z = z;
