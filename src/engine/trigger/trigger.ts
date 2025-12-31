import { EntryId, TriggerApplication, TriggerData, TriggerNode } from "engine";
import { R } from "module-helpers";

class Trigger<TNode extends TriggerNode = TriggerNode> {
    #data: TriggerData;
    #nodes: Collection<TNode> = new Collection();
    #parent: TriggerApplication;

    constructor(parent: TriggerApplication, data: TriggerData) {
        this.#data = data;
        this.#parent = parent;
    }

    get application(): TriggerApplication {
        return this.#parent;
    }

    get data(): TriggerData {
        return this.#data;
    }

    get id(): string {
        return this.data.id;
    }

    get name(): string {
        return this.data.name;
    }

    get invalid(): boolean {
        return this.data.invalid;
    }

    // TODO need to actually implement that when module triggers is done
    get locked(): boolean {
        return false;
    }

    get nodes(): Collection<TNode> {
        return this.#nodes;
    }

    getNode(id: string): TNode | undefined {
        // TODO we need to instantiate the node
        return this.nodes.get(id);
    }

    toObject() {
        return this.data.toObject();
    }
}

export { Trigger };
