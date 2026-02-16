import { mapConvertors } from "engine";
import { MODULE, R } from "foundry-helpers";
import { builtinsConvertors, builtinsEntries } from ".";
import hooks from "./hooks";
import nodes from "./nodes";

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
