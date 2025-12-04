import { MODULE, R } from "module-helpers";
import { NumberNodeEntry, TestTriggerNode } from ".";

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

    static entries = R.mapToObj(
        [NumberNodeEntry] as const, //
        (entry) => [entry.type, entry] as const
    );

    static nodes = R.mapToObj(
        [TestTriggerNode] as const, //
        (node) => [node.type, node] as const
    );
}

export { BuiltInApplication };
