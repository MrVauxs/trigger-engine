import {
    CreateNodeData,
    instantiateNode,
    OpenTriggerNode,
    Trigger,
    TriggerApplication,
    TriggerData,
    TriggerDataSource,
    UpdateNodeData,
    UpdateTriggerData,
} from "engine";
import { enrichHTML, MODULE } from "module-helpers";

class OpenTrigger extends Trigger<OpenTriggerNode> {
    constructor(parent: TriggerApplication, data: TriggerData) {
        super(parent, data);

        for (const nodeData of data.nodes) {
            try {
                const node = instantiateNode(this, nodeData, true);
                if (!node) continue;

                this.nodes.set(node.id, node);
            } catch (error) {}
        }
    }

    get applicationKey(): string {
        return this.data.applicationKey;
    }

    get path(): string {
        return `${this.applicationKey}:${this.id}`;
    }

    get description(): string {
        return this.data.description;
    }

    get enrichedDescription(): Promise<string> {
        return enrichHTML(this.description);
    }

    get folder(): string {
        return this.data.folder;
    }

    get label(): string {
        return this.name || this.id;
    }

    get tags(): string[] {
        return this.data.tags;
    }

    getNode(id: string): OpenTriggerNode | undefined {
        return this.nodes.get(id);
    }

    update(data: UpdateTriggerData): DeepPartial<TriggerDataSource> {
        return this.data.updateSource(data);
    }

    updateNode(id: string, updates: UpdateNodeData) {
        const data = this.data.nodes.get(id);
        data?.updateSource(updates);
    }

    duplicate(): TriggerDataSource {
        const clone = this.data.clone({
            _id: foundry.utils.randomID(),
            name: this.name ? game.i18n.format("DOCUMENT.CopyOf", { name: this.name }) : "",
        } satisfies DeepPartial<TriggerDataSource>);

        return clone.toObject();
    }

    addNode(source: CreateNodeData): OpenTriggerNode | undefined {
        try {
            const data = this.data.addNode(source);

            if (!data || data.invalid) {
                throw new Error("The provided NodeData source is invalid.");
            }

            const node = instantiateNode(this, data, true);

            if (node) {
                this.nodes.set(node.id, node);
                return node;
            }
        } catch (error) {
            MODULE.error(`an error ocurred while trying to add a TriggerNode.`, error);
        }
    }

    toObject() {
        return this.data.toObject();
    }
}

export { OpenTrigger };
