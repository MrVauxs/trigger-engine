import { Trigger, TriggerNode } from "engine";
import { z, zString } from "module-helpers";

class NodeBridge {
    #schema: BridgeSchema;

    constructor(trigger: Trigger, parent: TriggerNode, schema: BridgeSchema) {
        this.#schema = zNodeBridgeSchema().parse(schema);
    }

    get key(): string {
        return this.#schema.key;
    }

    get label(): string | undefined {
        return this.#schema.label;
    }
}

function zNodeBridgeSchema() {
    return z.object({
        key: zString(),
        label: zString().optional().catch(undefined),
        state: zString().optional().catch(undefined),
    });
}

type BridgeSchema = z.infer<ReturnType<typeof zNodeBridgeSchema>>;

export { NodeBridge, zNodeBridgeSchema };
export type { BridgeSchema };
