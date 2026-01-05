import { ConnectionId, NodeData } from "engine";
import { BridgeSchemaInput } from ".";
import { EntryCategory } from "triggers-menu";

class NodeBridge {
    #category: EntryCategory;
    #schema: BridgeSchemaInput;
    #nodeData: NodeData;

    constructor(category: EntryCategory, nodeData: NodeData, schema: BridgeSchemaInput) {
        this.#category = category;
        this.#nodeData = nodeData;
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

    get connection(): ConnectionId | undefined {
        return this.#category === "outputs" ? this.#nodeData.outs[this.key]?.connection : undefined;
    }
}

export { NodeBridge };
