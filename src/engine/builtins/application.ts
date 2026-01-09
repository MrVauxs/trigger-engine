import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import {
    AwaitConfirmActionNode,
    ConsoleLogActionNode,
    ExecuteEventNode,
    ExecuteHook,
    RegionEventNode,
    RegionHook,
    ExecuteScriptActionNode,
    TestEventNode,
    TestHook,
    UserValueNode,
    builtinsEntries,
    convertors,
} from ".";

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

    static hooks = R.map([ExecuteHook, RegionHook, TestHook], (entry) => [entry.type, entry] as const);

    static nodes = R.map(
        [
            AwaitConfirmActionNode,
            ConsoleLogActionNode,
            ExecuteEventNode,
            RegionEventNode,
            ExecuteScriptActionNode,
            TestEventNode,
            UserValueNode,
        ],
        (node) => [node.type, node] as const,
    );
}

export { BuiltInApplication };
