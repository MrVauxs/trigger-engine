import { Trigger, TriggerNode } from "engine";
import { BridgeSchema } from ".";

class NodeBridge {
    #schema: BridgeSchema;

    constructor(trigger: Trigger, parent: TriggerNode, schema: BridgeSchema) {
        this.#schema = schema;
    }

    get key(): string {
        return this.#schema.key;
    }

    get label(): string | undefined {
        return this.#schema.label;
    }
}

export { NodeBridge };
