import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import {
    ActorExtractorNode,
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
    FormatTextLogicNode,
    IfTruthyConditionNode,
    ItemExtractorNode,
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

const conditions = [IfTruthyConditionNode, ListContainsConditionNode] as const;

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

const extractors = [ActorExtractorNode, ItemExtractorNode] as const;

const logics = [BreakLoopLogicNode, CompareNumbersLogicNode, FormatTextLogicNode] as const;

const splitters = [BooleanSplitterNode, NumberSplitterNode, TextSplitterNode] as const;

const values = [UserValueNode] as const;

const nodes = [...actions, ...conditions, ...events, ...extractors, ...logics, ...splitters, ...values] as const;

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
