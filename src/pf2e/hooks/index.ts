import { TriggerHook } from "engine";
import { AuraHook, CreateMessageHook, ToolbeltSaveHook, TurnEndHook, TurnStartHook } from ".";

export * from "./aura-hook";
export * from "./create-message";
export * from "./toolbelt-save";
export * from "./turn-end";
export * from "./turn-start";

export default [AuraHook, CreateMessageHook, ToolbeltSaveHook, TurnEndHook, TurnStartHook] as (typeof TriggerHook)[];
