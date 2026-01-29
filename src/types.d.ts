import {
    NodeEntry as _NodeEntry,
    NodeField as _NodeField,
    TriggerHook as _TriggerHook,
    TriggerNode as _TriggerNode,
    TriggerApplication,
} from "engine";

declare global {
    namespace triggerEngine {
        const NodeEntry: typeof _NodeEntry;
        const NodeField: typeof _NodeField;
        const TriggerHook: typeof _TriggerHook;
        const TriggerNode: typeof _TriggerNode;
        const openBlueprintMenu: typeof TriggerApplication.openBlueprintMenu;
    }
}
