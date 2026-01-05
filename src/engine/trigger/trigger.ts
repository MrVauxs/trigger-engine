import { TriggerApplication, TriggerData, TriggerDataOutput, TriggerNode, instantiateNode } from "engine";

class Trigger<TNode extends TriggerNode = TriggerNode> {
    #data: TriggerData;
    #nodes: Collection<TNode> = new Collection();
    #parent: TriggerApplication;

    constructor(parent: TriggerApplication, data: TriggerData) {
        this.#data = data;
        this.#parent = parent;

        Object.defineProperty(this, "nodes", {
            get() {
                return this.#nodes;
            },
        });
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

    getNode(id: string): TNode | undefined {
        // we instantiate the node on the fly
        if (!this.#nodes.has(id)) {
            try {
                const nodeData = this.data.nodes.get(id);
                if (!nodeData) return;

                const node = instantiateNode<TNode>(this, nodeData, true);
                if (!node || node.invalid) return;

                this.#nodes.set(node.id, node);
                return node;
            } catch (error) {
                return;
            }
        }

        return this.#nodes.get(id);
    }

    toObject(): TriggerDataOutput {
        return this.data.toObject();
    }

    test(): boolean {
        for (const nodeData of this.data.nodes) {
            const node = instantiateNode(this, nodeData, false);
            if (!node || node.invalid) return false;
        }
        return true;
    }
}

interface Trigger {}

export { Trigger };
