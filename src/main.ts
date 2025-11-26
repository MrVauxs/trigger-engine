import {
    NodeEntry,
    prepareModuleTriggers,
    prepareWorldTriggers,
    registerEntries,
    registerHooks,
    registerNodes,
    TriggerHook,
    TriggerNode,
} from "engine";
import { MODULE, registerSetting, registerSettingMenu } from "module-helpers";
import { TestNode } from "pf2e/test";
import { BlueprintApplication } from "triggers-menu";

MODULE.register("trigger-engine", { game: "triggerEngine" });

Hooks.once("init", async () => {
    registerSetting("world-triggers", {
        type: Array,
        default: [],
        scope: "world",
        config: false,
        onChange: () => {
            prepareWorldTriggers();
        },
    });

    registerSettingMenu("triggers-menu", {
        type: BlueprintApplication,
        restricted: true,
    });

    await prepareModuleTriggers();
    prepareWorldTriggers();

    Hooks.callAll("trigger-engine.init", MODULE.current.api);
});

Hooks.once("setup", async () => {
    Hooks.callAll("trigger-engine.setup", MODULE.current.api);
});

Hooks.once("trigger-engine.setup", () => {
    registerNodes(MODULE.id, TestNode);
});

Hooks.once("ready", () => {
    // await prepareModuleTriggers();
    // prepareWorldTriggers();
});

function openBlueprintMenu() {
    new BlueprintApplication().render(true);
}

MODULE.apiExpose({
    openBlueprintMenu,
});

globalThis.triggerEngine = {
    NodeEntry,
    TriggerHook,
    TriggerNode,
    openBlueprintMenu,
    registerEntries,
    registerHooks,
    registerNodes,
};
