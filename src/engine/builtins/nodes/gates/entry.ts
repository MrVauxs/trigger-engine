import { IconObject } from "_zod";
import { CustomInputSchema, TriggerNode } from "engine";

class TriggerGateEntry extends TriggerNode {
    static get category(): string {
        return "__gate__";
    }

    static get type(): string {
        return "__gate_entry__";
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
    return node.type === TriggerGateEntry.type;
}

export { isEntryGate, TriggerGateEntry };
