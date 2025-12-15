import { mapToObjByKey, MODULE } from "module-helpers";
import { BooleanEntry, NumberEntry, TestTriggerNode, TextEntry } from ".";

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

    static entries = mapToObjByKey([BooleanEntry, NumberEntry, TextEntry] as const, "type");

    static nodes = mapToObjByKey([TestTriggerNode] as const, "type");
}

export { BuiltInApplication };
