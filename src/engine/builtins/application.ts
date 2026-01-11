import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import {
    AwaitConfirmActionNode,
    ConsoleLogActionNode,
    CreateCombatantEvent,
    CreateCombatantHook,
    CreateMessageActionNode,
    DeleteCombatantEvent,
    DeleteCombatantHook,
    DeleteItemActionNode,
    ExecuteEventNode,
    ExecuteHook,
    ExecuteScriptActionNode,
    RegionEventNode,
    RegionHook,
    TestEventNode,
    TestHook,
    TokenMovedEvent,
    TokenMovedHook,
    UserValueNode,
    builtinsEntries,
    convertors,
} from ".";

const hooks = [CreateCombatantHook, DeleteCombatantHook, ExecuteHook, RegionHook, TestHook, TokenMovedHook] as const;

const nodes = [
    AwaitConfirmActionNode,
    ConsoleLogActionNode,
    CreateCombatantEvent,
    CreateMessageActionNode,
    DeleteCombatantEvent,
    DeleteItemActionNode,
    ExecuteEventNode,
    ExecuteScriptActionNode,
    RegionEventNode,
    TestEventNode,
    TokenMovedEvent,
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

    static convertors = mapConvertors(convertors);

    static entries = R.map(builtinsEntries, (entry) => [entry.type, entry] as const);

    static hooks = R.map(hooks, (entry) => [entry.type, entry] as const);

    static nodes = R.map(nodes, (node) => [node.type, node] as const);
}

export { BuiltInApplication };
