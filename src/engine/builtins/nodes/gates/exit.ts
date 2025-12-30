import { IconObject } from "_zod";
import { CustomOutputSchema, TriggerNode } from "engine";

class TriggerGateExit extends TriggerNode {
    static get category(): string {
        return "__gate__";
    }

    static get type(): string {
        return "__gate_exit__";
    }

    static get tags(): string[] {
        return ["gate", "exit"];
    }

    static get defineCustomOutputs(): CustomOutputSchema[] {
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
            unicode: "\ue01c",
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

function isExitGate(node: { type: string }): boolean {
    return node.type === TriggerGateExit.type;
}

export { isExitGate, TriggerGateExit };
