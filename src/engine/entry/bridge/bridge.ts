import { ConnectionId, NodeData } from "engine";
import { EntryCategory } from "triggers-menu";
import { BridgeSchemaOutput } from ".";

class NodeBridge {
    #category: EntryCategory;
    #schema: BridgeSchemaOutput;
    #nodeData: NodeData;

    constructor(category: EntryCategory, nodeData: NodeData, schema: BridgeSchemaOutput) {
        this.#category = category;
        this.#nodeData = nodeData;
        this.#schema = schema;
    }

    get connection(): ConnectionId | undefined {
        return this.#category === "outputs" ? this.#nodeData.outs[this.key]?.connection : undefined;
    }

    get input(): string | number | undefined {
        return this.#schema.input;
    }

    get key(): string {
        return this.#schema.key;
    }

    get label(): string | undefined {
        return this.#schema.label;
    }

    get schema(): BridgeSchemaOutput {
        return this.#schema;
    }

    get slug(): string | undefined {
        return this.schema.slug;
    }

    get spacing(): number {
        return this.schema.spacing;
    }
}

export { NodeBridge };
