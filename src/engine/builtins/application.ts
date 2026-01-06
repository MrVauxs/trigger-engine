import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import {
    BooleanEntry,
    convertors,
    NumberEntry,
    TestHook,
    TestEventNode,
    TextEntry,
    ConsoleActionNode,
    RegionHook,
    RegionEventNode,
    TargetEntry,
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

    static entries = R.map(
        [BooleanEntry, NumberEntry, TargetEntry, TextEntry],
        (entry) => [entry.type, entry] as const,
    );

    static nodes = R.map([ConsoleActionNode, RegionEventNode, TestEventNode], (node) => [node.type, node] as const);

    static convertors = mapConvertors(convertors);

    static hooks = R.map([RegionHook, TestHook], (entry) => [entry.type, entry] as const);
}

export { BuiltInApplication };
