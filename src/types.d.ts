import {
    NodeEntry as _NodeEntry,
    openBlueprintMenu as _openBlueprintMenu,
    TriggerHook as _TriggerHook,
    TriggerNode as _TriggerNode,
} from "engine";

declare global {
    namespace triggerEngine {
        const NodeEntry: typeof _NodeEntry;
        const TriggerHook: typeof _TriggerHook;
        const TriggerNode: typeof _TriggerNode;
        const openBlueprintMenu: typeof _openBlueprintMenu;
    }
}
