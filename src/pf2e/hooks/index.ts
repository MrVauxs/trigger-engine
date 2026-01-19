import { TriggerHook } from "engine";
import { TurnEndHook } from ".";
import { TurnStartHook } from ".";
import { CreateMessageHook } from ".";
import { AuraHook } from ".";

export * from "./aura-hook";
export * from "./create-message";
export * from "./turn-end";
export * from "./turn-start";

export default [AuraHook, CreateMessageHook, TurnEndHook, TurnStartHook] as (typeof TriggerHook)[];
