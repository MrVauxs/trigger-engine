import {
    CreateNodeDataSource,
    TriggerApplication,
    TriggerData,
    TriggerDataSource,
    TriggerNode,
} from "engine";
import { enrichHTML, MODULE, R } from "module-helpers";

class Trigger {
    #data: TriggerData;
    #nodes: Collection<TriggerNode>;
    #parent: TriggerApplication;

    constructor(parent: TriggerApplication, data: TriggerData) {
        this.#data = data;
        this.#parent = parent;

        this.#nodes = new Collection(
            R.pipe(
                data.nodes.contents,
                R.map((data) => {
                    try {
                        const NodeCls = this.parent.nodes.get(data);
                        if (!NodeCls) return;

                        const node = new NodeCls(this, data);
                        return [node.id, node] as const;
                    } catch (error) {}
                }),
                R.filter(R.isTruthy)
            )
        );
    }

    get parent(): TriggerApplication {
        return this.#parent;
    }

    get applicationKey(): string {
        return this.#data.applicationKey;
    }

    get path(): string {
        return `${this.applicationKey}:${this.id}`;
    }

    get id(): string {
        return this.#data.id;
    }

    get description(): string {
        return this.#data.description;
    }

    get enrichedDescription(): Promise<string> {
        return enrichHTML(this.description);
    }

    get folder(): string {
        return this.#data.folder;
    }

    get label(): string {
        return this.name || this.id;
    }

    get name(): string {
        return this.#data.name;
    }

    get tags(): string[] {
        return this.#data.tags;
    }

    get invalid(): boolean {
        return this.#data.invalid;
    }

    // TODO need to actually implement that when module triggers is done
    get locked(): boolean {
        return false;
    }

    get nodes(): Collection<TriggerNode> {
        return this.#nodes;
    }

    update(data: UpdateTriggerData): DeepPartial<TriggerDataSource> {
        return this.#data.updateSource(data);
    }

    duplicate(): TriggerDataSource {
        const source = this.#data.clone({
            _id: foundry.utils.randomID(),
            name: this.name ? game.i18n.format("DOCUMENT.CopyOf", { name: this.name }) : "",
        } satisfies DeepPartial<TriggerDataSource>);

        return source.toObject();
    }

    addNode(NodeCls: typeof TriggerNode, source: CreateNodeDataSource): TriggerNode | undefined {
        try {
            const data = this.#data.addNode(source);

            if (!data || data.invalid) {
                throw new Error("The provided NodeData source is invalid.");
            }

            const node = new NodeCls(this, data);
            this.#nodes.set(node.id, node);

            return node;
        } catch (error) {
            MODULE.error(`an error ocurred while trying to add a TriggerNode.`, error);
        }
    }

    toObject() {
        return this.#data.toObject();
    }
}

interface Trigger {}

type UpdateTriggerData = DeepPartial<Omit<TriggerDataSource, "_id" | "_nodes" | "applicationKey">>;

export { Trigger };
export type { UpdateTriggerData };
