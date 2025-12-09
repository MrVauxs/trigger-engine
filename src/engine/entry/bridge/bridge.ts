import { TriggerNode } from "engine";
import { BridgeSchema, NodeBridgeData } from ".";

class NodeBridge {
    #data: NodeBridgeData | undefined;
    #schema: BridgeSchema;

    constructor(parent: TriggerNode, schema: BridgeSchema, data: NodeBridgeData | undefined) {
        this.#data = data;
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
