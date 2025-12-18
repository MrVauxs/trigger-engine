import { mapConvertors } from "engine";
import { MODULE, R } from "module-helpers";
import { BooleanEntry, convertors, NumberEntry, TestTriggerNode, TextEntry } from ".";

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
        [BooleanEntry, NumberEntry, TextEntry],
        (entry) => [entry.type, entry] as const
    );

    static nodes = R.map([TestTriggerNode], (node) => [node.type, node] as const);

    static convertors = mapConvertors(convertors);
}

export { BuiltInApplication };
