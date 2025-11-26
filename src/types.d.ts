import {
    NodeEntry as _NodeEntry,
    registerEntries as _registerEntries,
    registerHooks as _registerHooks,
    registerNodes as _registerNodes,
    TriggerHook as _TriggerHook,
    TriggerNode as _TriggerNode,
} from "engine";
import { openBlueprintMenu as _openBlueprintMenu } from "./triggers-menu";

declare global {
    namespace triggerEngine {
        const NodeEntry: typeof _NodeEntry;
        const TriggerHook: typeof _TriggerHook;
        const TriggerNode: typeof _TriggerNode;
        const openBlueprintMenu: typeof _openBlueprintMenu;
        const registerEntries: typeof _registerEntries;
        const registerHooks: typeof _registerHooks;
        const registerNodes: typeof _registerNodes;
    }
}
