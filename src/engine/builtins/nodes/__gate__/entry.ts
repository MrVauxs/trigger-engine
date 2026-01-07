import { IconObject } from "_zod";
import { ENTRY_GATE_TYPE, GATE_CATEGORY, TriggerNode } from "engine";

class TriggerGateEntry extends TriggerNode<"out", never, never, "entry"> {
    static get category(): string {
        return GATE_CATEGORY;
    }

    static get type(): string {
        return ENTRY_GATE_TYPE;
    }

    get headerColor(): `#${string}` {
        return "#C40000";
    }

    get icon(): IconObject {
        return {
            unicode: "\uf1e6",
            fontWeight: "800",
        };
    }

    async _execute(): Promise<boolean> {
        const values = (await this.getCustomInputsValues("entry")).map(({ value }) => value);
        return this.executeNext("out", values);
    }
}

function isGateEntryNode(node: { type: string }): boolean {
    return node.type === ENTRY_GATE_TYPE;
}

export { isGateEntryNode, TriggerGateEntry };
