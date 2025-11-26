import { getTriggerNode, TriggerData, TriggerDataSource, TriggerNode } from "engine";
import { enrichHTML, MODULE, R } from "module-helpers";

class Trigger {
    #data: TriggerData;
    #nodes: Collection<TriggerNode>;

    constructor(data: TriggerData) {
        this.#data = data;

        this.#nodes = new Collection(
            R.pipe(
                data.nodes.contents,
                R.map((data) => {
                    try {
                        const NodeCls = getTriggerNode(data.module, data.type);
                        if (!NodeCls) return;

                        const node = new NodeCls(this, data);
                        return [node.id, node] as const;
                    } catch (error) {}
                }),
                R.filter(R.isTruthy)
            )
        );
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

    static create(source: CreateTriggerData): Trigger | undefined {
        try {
            const data = new TriggerData(source);
            return new Trigger(data);
        } catch (error) {
            MODULE.error(`an error ocurred while trying to create a Trigger.`, error);
        }
    }
}

interface Trigger {}

type CreateTriggerData = WithRequired<DeepPartial<TriggerDataSource>, "system">;

export { Trigger };
