import { TriggerHook } from "engine";
import {
    AuraHook,
    CreateMessageHook,
    PF2eTriggerEngineRegionBehaviorType,
    ToolbeltSaveHook,
    TurnEndHook,
    TurnStartHook,
} from ".";

export * from "./aura-hook";
export * from "./create-message";
export * from "./region-hook";
export * from "./toolbelt-save";
export * from "./turn-end";
export * from "./turn-start";

export default [
    AuraHook,
    CreateMessageHook,
    PF2eTriggerEngineRegionBehaviorType,
    ToolbeltSaveHook,
    TurnEndHook,
    TurnStartHook,
] as (typeof TriggerHook)[];
