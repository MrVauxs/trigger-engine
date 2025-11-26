import {
    NodeEntry,
    openBlueprintMenu,
    registerApplication,
    registerEntries,
    registerHooks,
    registerNodes,
    TriggerHook,
    TriggerNode,
} from "engine";
import { MODULE } from "module-helpers";

MODULE.register("trigger-engine", { game: "triggerEngine" });

Hooks.once("init", async () => {
    // registerSetting("world-triggers", {
    //     type: Array,
    //     default: [],
    //     scope: "world",
    //     config: false,
    //     onChange: () => {
    //         prepareTriggers();
    //     },
    // });
    // registerSettingMenu("triggers-menu", {
    //     type: BlueprintApplication,
    //     restricted: true,
    // });
});

Hooks.once("setup", async () => {
    // Hooks.callAll("trigger-engine.setup", MODULE.current.api);
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
    registerApplication,
    registerEntries,
    registerHooks,
    registerNodes,
};
