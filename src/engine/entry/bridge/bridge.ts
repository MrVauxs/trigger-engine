import { ConnectionId, NodeData, TriggerNode } from "engine";
import { R } from "foundry-helpers";
import { EntryCategory } from "triggers-menu";
import { BridgeSchemaOutput } from ".";

class NodeBridge {
    #category: EntryCategory;
    #parent: TriggerNode;
    #schema: BridgeSchemaOutput;
    #nodeData: NodeData;

    constructor(parent: TriggerNode, category: EntryCategory, nodeData: NodeData, schema: BridgeSchemaOutput) {
        this.#category = category;
        this.#nodeData = nodeData;
        this.#parent = parent;
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

    /** only outs can have tooltips */
    generateTooltip(): string | undefined {
        if (this.schema.tooltip === false) return;

        if (R.isString(this.schema.tooltip)) {
            return game.i18n.localize(this.schema.tooltip);
        }

        return this.slug
            ? this.#parent.localize("customs.outs", this.slug, "tooltip")
            : this.#parent.localize("outs", this.key, "tooltip");
    }
}

export { NodeBridge };
