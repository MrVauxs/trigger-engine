import { IconObject } from "_zod";
import { CustomOutputSchema, EXIT_GATE_TYPE, GATE_CATEGORY, TriggerNode } from "engine";

class TriggerGateExit extends TriggerNode {
    static get category(): string {
        return GATE_CATEGORY;
    }

    static get type(): string {
        return EXIT_GATE_TYPE;
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

    _execute(options?: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    _query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

function isGateExitNode(node: { type: string }): boolean {
    return node.type === EXIT_GATE_TYPE;
}

export { isGateExitNode, TriggerGateExit };
