import { TriggerApplication, TriggerApplicationOptions, TriggerHook, TriggerNode } from "engine";
import { MODULE } from "module-helpers";
import {
    AttackRollEvent,
    AuraEnterEvent,
    AuraHook,
    AuraLeaveEvent,
    CompareOutcomesLogicNode,
    CreateConditionActionNode,
    CreateEffectActionNode,
    CreateItemActionNode,
    CreateMessageHook,
    DamageTakenEvent,
    HasItemConditionNode,
    HasOptionConditionNode,
    InsideAuraConditionNode,
    IsDeadConditionNode,
    ItemValueNode,
    OutcomeSplitterNode,
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

const actions = [
    CreateConditionActionNode,
    CreateEffectActionNode,
    CreateItemActionNode,
    RollDamageActionNode,
    RollSaveActionNode,
    SendToChatActionNode,
] as (typeof TriggerNode)[];

const conditions = [
    HasItemConditionNode,
    HasOptionConditionNode,
    InsideAuraConditionNode,
    IsDeadConditionNode,
] as (typeof TriggerNode)[];

const events = [
    AttackRollEvent,
    AuraEnterEvent,
    AuraLeaveEvent,
    DamageTakenEvent,
    TurnEndEvent,
    TurnStartEvent,
] as (typeof TriggerNode)[];

const logics = [CompareOutcomesLogicNode];

const splitters = [OutcomeSplitterNode];

const values = [ItemValueNode];

function registerPF2eApplication() {
    const options: TriggerApplicationOptions = {
        builtins: true,
        convertors: pf2eConvertors,
        entries: pf2eEntries as any,
        hooks: [AuraHook, CreateMessageHook, TurnEndHook, TurnStartHook] as (typeof TriggerHook)[],
        nodes: [...actions, ...conditions, ...events, ...logics, ...splitters, ...values] as (typeof TriggerNode)[],
    };

    TriggerApplication.register(MODULE.id, "pf2e-trigger", options);
}

export { registerPF2eApplication };
