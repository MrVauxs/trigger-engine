import { mapToObjByKey, MODULE } from "module-helpers";
import { NumberEntry, TestTriggerNode } from ".";

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

    static entries = mapToObjByKey([NumberEntry] as const, "type");

    static nodes = mapToObjByKey([TestTriggerNode] as const, "type");
}

export { BuiltInApplication };
