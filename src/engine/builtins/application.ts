import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import {
    AwaitConfirmActionNode,
    BooleanSplitterNode,
    BreakLoopLogicNode,
    CompareNumbersLogicNode,
    ConsoleLogActionNode,
    CreateCombatantEvent,
    CreateCombatantHook,
    CreateMessageActionNode,
    CreateTokenEvent,
    CreateTokenHook,
    DeleteCombatantEvent,
    DeleteCombatantHook,
    DeleteItemActionNode,
    DeleteTokenEvent,
    DeleteTokenHook,
    ExecuteEvent,
    ExecuteHook,
    ExecuteScriptActionNode,
    ListContainsConditionNode,
    MoveTokenEvent,
    MoveTokenHook,
    NumberSplitterNode,
    RegionEvent,
    RegionHook,
    TestEvent,
    TestHook,
    TextSplitterNode,
    UserValueNode,
    builtinsConvertors,
    builtinsEntries,
} from ".";

const hooks = [
    CreateCombatantHook,
    CreateTokenHook,
    DeleteCombatantHook,
    DeleteTokenHook,
    ExecuteHook,
    MoveTokenHook,
    RegionHook,
    TestHook,
] as const;

const actions = [
    AwaitConfirmActionNode,
    ConsoleLogActionNode,
    CreateMessageActionNode,
    DeleteItemActionNode,
    ExecuteScriptActionNode,
] as const;

const conditions = [ListContainsConditionNode] as const;

const events = [
    CreateCombatantEvent,
    CreateTokenEvent,
    DeleteCombatantEvent,
    DeleteTokenEvent,
    ExecuteEvent,
    MoveTokenEvent,
    RegionEvent,
    TestEvent,
] as const;

const logics = [BreakLoopLogicNode, CompareNumbersLogicNode] as const;

const splitters = [BooleanSplitterNode, NumberSplitterNode, TextSplitterNode] as const;

const values = [UserValueNode] as const;

const nodes = [...actions, ...conditions, ...events, ...logics, ...splitters, ...values] as const;

class BuiltInApplication {
    static get moduleId(): string {
        return MODULE.id;
    }

    static get applicationId(): string {
        return "builtins";
    }

    static get applicationKey(): string {
        return `${this.moduleId}:${this.applicationId}`;
    }

    static get localizePath(): string {
        return `${this.moduleId}.${this.applicationId}`;
    }

    static convertors = mapConvertors(builtinsConvertors);

    static entries = R.map(builtinsEntries, (entry) => [entry.type, entry] as const);

    static hooks = R.map(hooks, (entry) => [entry.type, entry] as const);

    static nodes = R.map(nodes, (node) => [node.type, node] as const);
}

export { BuiltInApplication };
