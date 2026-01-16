import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import {
    AwaitConfirmActionNode,
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
    ExecuteEventNode,
    ExecuteHook,
    ExecuteScriptActionNode,
    MoveTokenEvent,
    MoveTokenHook,
    RegionEventNode,
    RegionHook,
    TestEventNode,
    TestHook,
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

const nodes = [
    AwaitConfirmActionNode,
    CompareNumbersLogicNode,
    ConsoleLogActionNode,
    CreateCombatantEvent,
    CreateMessageActionNode,
    CreateTokenEvent,
    DeleteCombatantEvent,
    DeleteItemActionNode,
    DeleteTokenEvent,
    ExecuteEventNode,
    ExecuteScriptActionNode,
    MoveTokenEvent,
    RegionEventNode,
    TestEventNode,
    UserValueNode,
] as const;

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
