import {
    ApplicationKey,
    EntryId,
    TriggerApplication,
    TriggerData,
    TriggerDataOutput,
    TriggerNode,
    instantiateNode,
} from "engine";
import { R, UserPF2e } from "module-helpers";

class Trigger<TNode extends TriggerNode = TriggerNode> {
    #data: TriggerData;
    #nodes: Collection<TNode> = new Collection();
    #parent: TriggerApplication;
    #userId: string;

    constructor(parent: TriggerApplication, data: TriggerData, userId: string = game.userId) {
        this.#data = data;
        this.#parent = parent;
        this.#userId = userId;

        Object.defineProperty(this, "nodes", {
            get() {
                return this.#nodes;
            },
        });
    }

    get application(): TriggerApplication {
        return this.#parent;
    }

    get path(): TriggerPath {
        return `${this.applicationKey}:${this.id}`;
    }

    get applicationKey(): ApplicationKey {
        return this.application.applicationKey;
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

    get userContext(): UserPF2e {
        return game.users.get(this.#userId) ?? game.user;
    }

    set userContext(user) {
        this.#userId = user.id;
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

                const node = instantiateNode<TNode>(this, nodeData, false);
                if (!node || node.invalid) return;

                this.#nodes.set(node.id, node);
                return node;
            } catch (error) {
                return;
            }
        }

        return this.#nodes.get(id);
    }

    getNodeFromEntryId(id: EntryId): TNode | undefined {
        const [nodeId] = R.split(id, ":");
        return this.getNode(nodeId);
    }

    test(): boolean {
        for (const nodeData of this.data.nodes) {
            const node = instantiateNode(this, nodeData, false);
            if (!node || node.invalid) return false;
        }
        return true;
    }

    toObject(): TriggerDataOutput {
        return this.data.toObject();
    }
}

function getTriggerPathData(triggerPath: TriggerPath): TriggerPathData {
    const [moduleId, applicationId, triggerId] = R.split(triggerPath, ":");
    return {
        moduleId,
        applicationId,
        triggerId,
    };
}

type TriggerPath = `${ApplicationKey}:${string}`;

type TriggerPathData = {
    moduleId: string;
    applicationId: string;
    triggerId: string;
};

export { Trigger, getTriggerPathData };
export type { TriggerPath, TriggerPathData };
