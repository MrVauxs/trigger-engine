import { TriggerApplication, TriggerApplicationOptions, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import {
    CreateCombatantHook,
    CreateItemActionNode,
    DeleteCombatantHook,
    TokenMovedEvent,
    TokenMovedHook,
    TurnEndEvent,
    TurnEndHook,
    TurnStartEvent,
    TurnStartHook,
} from ".";

const hooks = [
    CreateCombatantHook,
    DeleteCombatantHook,
    TokenMovedHook,
    TurnEndHook,
    TurnStartHook,
] as (typeof TriggerHook)[];

const nodes = [CreateItemActionNode, TokenMovedEvent, TurnEndEvent, TurnStartEvent] as (typeof TriggerNode)[];

function registerPF2eApplication() {
    const options: TriggerApplicationOptions = {
        builtins: true,
        convertors: [],
        entries: [],
        hooks,
        nodes,
    };

    TriggerApplication.register(MODULE.id, "pf2e-trigger", options);
}

export { registerPF2eApplication };
