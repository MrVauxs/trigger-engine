import * as TriggerEngine from "./engine/index";
import {
    BuiltInApplication,
    TriggerApplicationCollection,
    NodeEntry as _NodeEntry,
    NodeField as _NodeField,
    TriggerHook as _TriggerHook,
    TriggerNode as _TriggerNode,
} from "./engine/index";

declare module "@7h3laughingman/foundry-types/client/game.mjs" {
    export default interface Game<TActor, TActors, TChatMessage, TCombat, TItem, TMacro, TScene, TUser> {
        triggerEngine?: {
            api: {
                openBlueprintMenu: typeof TriggerEngine.TriggerApplication.openBlueprintMenu;
            };
        };
    }
}

declare global {
    namespace triggerEngine {
        const NodeEntry: typeof _NodeEntry;
        const NodeField: typeof _NodeField;
        const TriggerHook: typeof _TriggerHook;
        const TriggerNode: typeof _TriggerNode;
    }

    namespace Hooks {
        function on(
            hook: "triggerEngine.registerApplication",
            callback: (register: typeof TriggerEngine.TriggerApplication.register) => void,
            builtInKeys: BuiltInKeys,
        ): number;
        function on(
            hook: "triggerEngine.registerNodes",
            callback: (registerNodes: typeof TriggerEngine.TriggerApplication.registerNodes) => void,
        ): number;
        function on(
            hook: "triggerEngine.registerTriggers",
            callback: (registerTriggers: typeof TriggerEngine.TriggerApplication.registerTriggers) => void,
        ): number;
        function once(
            hook: "triggerEngine.registerApplication",
            callback: (register: typeof TriggerEngine.TriggerApplication.register) => void,
        ): number;
        function once(
            hook: "triggerEngine.registerNodes",
            callback: (registerNodes: typeof TriggerEngine.TriggerApplication.registerNodes) => void,
        ): number;
        function once(
            hook: "triggerEngine.registerTriggers",
            callback: (registerTriggers: typeof TriggerEngine.TriggerApplication.registerTriggers) => void,
        ): number;
    }
}

type BuiltInKeys = { [k in TriggerApplicationCollection]: (typeof BuiltInApplication)[k][number][0][] };

export type { TriggerEngine };
