import { GETTER_VARIABLE_TYPE, TriggerNode, VARIABLE_CATEGORY } from "engine";

class TriggerVariableGetter extends TriggerNode {
    static get category(): string {
        return VARIABLE_CATEGORY;
    }

    static get type(): string {
        return GETTER_VARIABLE_TYPE;
    }

    static get hasIn(): boolean {
        return false;
    }

    static get defineOuts(): null {
        return null;
    }

    get icon(): string {
        return "\uf044";
    }

    _execute(options?: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    _query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

function isVariableGetterNode(node: { type: string }): boolean {
    return node.type === GETTER_VARIABLE_TYPE;
}

export { isVariableGetterNode, TriggerVariableGetter };
