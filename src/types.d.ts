import {
    NodeEntry as _NodeEntry,
    openBlueprintMenu as _openBlueprintMenu,
    registerApplication as _registerApplication,
    registerEntries as _registerEntries,
    registerHooks as _registerHooks,
    registerNodes as _registerNodes,
    TriggerHook as _TriggerHook,
    TriggerNode as _TriggerNode,
} from "engine";

declare global {
    namespace triggerEngine {
        const NodeEntry: typeof _NodeEntry;
        const TriggerHook: typeof _TriggerHook;
        const TriggerNode: typeof _TriggerNode;
        const openBlueprintMenu: typeof _openBlueprintMenu;
        const registerApplication: typeof _registerApplication;
        const registerEntries: typeof _registerEntries;
        const registerHooks: typeof _registerHooks;
        const registerNodes: typeof _registerNodes;
    }
}
