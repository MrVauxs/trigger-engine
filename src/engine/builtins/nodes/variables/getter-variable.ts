import { IconObject } from "_zod";
import { GETTER_VARIABLE_TYPE, TriggerNode, VARIABLE_CATEGORY } from "engine";

class TriggerVariableGetter extends TriggerNode<never, { entry: any }> {
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

    get icon(): IconObject {
        return { unicode: "\uf044" };
    }

    _query(): Promise<any> {
        return this.getInputValue("entry");
    }
}

function isVariableGetterNode(node: { type: string }): boolean {
    return node.type === GETTER_VARIABLE_TYPE;
}

export { isVariableGetterNode, TriggerVariableGetter };
