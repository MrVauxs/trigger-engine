import { TriggerApplication, TriggerApplicationOptions, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import {
    AuraEnterEvent,
    AuraHook,
    AuraLeaveEvent,
    CreateItemActionNode,
    TurnEndEvent,
    TurnEndHook,
    TurnStartEvent,
    TurnStartHook,
} from ".";

const hooks = [AuraHook, TurnEndHook, TurnStartHook] as (typeof TriggerHook)[];

const nodes = [
    AuraEnterEvent,
    AuraLeaveEvent,
    CreateItemActionNode,
    TurnEndEvent,
    TurnStartEvent,
] as (typeof TriggerNode)[];

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
