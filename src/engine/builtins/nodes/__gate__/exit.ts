import { IconObject } from "_zod";
import { CustomOutputSchema, EXIT_GATE_TYPE, GATE_CATEGORY, TriggerNode } from "engine";
import { R } from "module-helpers";

class TriggerGateExit extends TriggerNode<"out", never, never, never, "entry"> {
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

    _execute(values?: any[]): Promise<boolean> {
        values = R.isArray(values) ? values : [];
        this.setCustomOutputValues("entry", foundry.utils.deepClone(values));
        return this.executeNext("out");
    }
}

function isGateExitNode(node: { type: string }): boolean {
    return node.type === EXIT_GATE_TYPE;
}

export { isGateExitNode, TriggerGateExit };
