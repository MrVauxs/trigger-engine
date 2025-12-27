import { Trigger, TriggerNode } from "engine";
import { BridgeSchemaInput } from ".";

class NodeBridge {
    #schema: BridgeSchemaInput;

    constructor(trigger: Trigger, parent: TriggerNode, schema: BridgeSchemaInput) {
        this.#schema = schema;
    }

    get key(): string {
        return this.#schema.key;
    }

    get label(): string | undefined {
        return this.#schema.label;
    }

    get schema(): BridgeSchemaInput {
        return this.#schema;
    }
}

export { NodeBridge };
