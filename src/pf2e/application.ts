import { TriggerApplication, TriggerApplicationOptions, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import {
    AttackRollEvent,
    AuraEnterEvent,
    AuraHook,
    AuraLeaveEvent,
    CompareOutcomesNode,
    CreateItemActionNode,
    CreateMessageHook,
    DamageTakenEvent,
    HasItemConditionNode,
    InsideAuraConditionNode,
    RollDamageActionNode,
    RollSaveActionNode,
    SendToChatActionNode,
    TurnEndEvent,
    TurnEndHook,
    TurnStartEvent,
    TurnStartHook,
    pf2eConvertors,
    pf2eEntries,
} from ".";

const hooks = [AuraHook, CreateMessageHook, TurnEndHook, TurnStartHook] as (typeof TriggerHook)[];

const nodes = [
    AttackRollEvent,
    AuraEnterEvent,
    AuraLeaveEvent,
    CompareOutcomesNode,
    CreateItemActionNode,
    DamageTakenEvent,
    HasItemConditionNode,
    InsideAuraConditionNode,
    RollDamageActionNode,
    RollSaveActionNode,
    SendToChatActionNode,
    TurnEndEvent,
    TurnStartEvent,
] as (typeof TriggerNode)[];

function registerPF2eApplication() {
    const options: TriggerApplicationOptions = {
        builtins: true,
        convertors: pf2eConvertors,
        entries: pf2eEntries as any,
        hooks,
        nodes,
    };

    TriggerApplication.register(MODULE.id, "pf2e-trigger", options);
}

export { registerPF2eApplication };
