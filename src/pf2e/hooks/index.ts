import { TriggerHook } from "engine";
import {
    AuraHook,
    CreateMessageHook,
    CreateRegionHook,
    PF2eTriggerEngineRegionBehaviorType,
    ToolbeltSaveHook,
    TurnEndHook,
    TurnStartHook,
} from ".";

export * from "./aura-hook";
export * from "./create-message";
export * from "./create-region";
export * from "./toolbelt-save";
export * from "./trigger-region";
export * from "./turn-end";
export * from "./turn-start";

export default [
    AuraHook,
    CreateMessageHook,
    CreateRegionHook,
    PF2eTriggerEngineRegionBehaviorType,
    ToolbeltSaveHook,
    TurnEndHook,
    TurnStartHook,
] as (typeof TriggerHook)[];
