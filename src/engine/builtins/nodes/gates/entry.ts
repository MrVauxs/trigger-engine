import { IconObject } from "_zod";
import { CustomInputSchema, ENTRY_GATE_TYPE, GATE_CATEGORY, TriggerNode } from "engine";

class TriggerGateEntry extends TriggerNode {
    static get category(): string {
        return GATE_CATEGORY;
    }

    static get type(): string {
        return ENTRY_GATE_TYPE;
    }

    static get tags(): string[] {
        return ["gate", "entry"];
    }

    static get defineCustomInputs(): CustomInputSchema[] {
        return [
            {
                array: true,
                slug: "entry",
            },
        ];
    }

    get headerColor(): `#${string}` {
        return "#C40000";
    }

    get icon(): IconObject {
        return {
            unicode: "\uf1e6",
            fontWeight: "400",
        };
    }

    execute(options?: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

function isEntryGate(node: { type: string }): boolean {
    return node.type === ENTRY_GATE_TYPE;
}

export { isEntryGate, TriggerGateEntry };
