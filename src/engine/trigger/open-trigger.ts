import {
    CreateNodeData,
    EntryId,
    instantiateNode,
    isGateExitNode,
    isVariableGetterNode,
    NodeData,
    OpenTriggerNode,
    Trigger,
    TriggerApplication,
    TriggerData,
    TriggerDataOutput,
    UpdateTriggerData,
} from "engine";
import { enrichHTML, MODULE, R } from "module-helpers";
import { TwoWaysEntryId } from "triggers-menu";

class OpenTrigger extends Trigger<OpenTriggerNode> {
    #computed: boolean = false;
    #computedConnections: Record<EntryId, boolean> = {};
    #linkedConnections: Set<TwoWaysEntryId> = new Set();

    constructor(parent: TriggerApplication, data: TriggerData) {
        super(parent, data);

        const sequences: ((nodeData: NodeData) => boolean)[] = [
            (nodeData) => isGateExitNode(nodeData),
            (nodeData) => !isGateExitNode(nodeData) && !isVariableGetterNode(nodeData),
            (nodeData) => isVariableGetterNode(nodeData),
        ];

        for (const fn of sequences) {
            for (const nodeData of data.nodes) {
                if (!fn(nodeData)) continue;

                try {
                    const node = instantiateNode(this, nodeData, true);
                    if (!node || node.invalid) continue;

                    this.nodes.set(node.id, node);
                } catch (error) {}
            }
        }
    }

    get linkedConnections(): Set<TwoWaysEntryId> {
        return this.#linkedConnections;
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

    get priority(): number {
        return this.data.priority;
    }

    get tags(): string[] {
        return R.filter([...this.data.tags, this.folder], R.isTruthy);
    }

    getNode(id: string): OpenTriggerNode | undefined {
        return this.nodes.get(id);
    }

    update(data: DeepPartial<UpdateTriggerData> & { [k: string]: any }): TriggerData {
        return this.data.update(data);
    }

    duplicate(): TriggerDataOutput {
        const source = this.data.toObject();

        source.id = foundry.utils.randomID();
        source.name = this.name ? game.i18n.format("DOCUMENT.CopyOf", { name: this.name }) : "";

        return source;
    }

    addNode(source: CreateNodeData): OpenTriggerNode | undefined {
        try {
            const data = this.data.nodes.addFromSource(source);

            if (!data || data.invalid) {
                throw new Error("The provided NodeData source is invalid.");
            }

            const node = instantiateNode(this, data, true);

            if (node) {
                this.nodes.set(node.id, node);
                return node;
            }
        } catch (error: any) {
            MODULE.error(`an error ocurred while trying to add a TriggerNode.`, error);
        }
    }

    refreshNode(id: string) {
        const current = this.getNode(id);
        if (!current) return;

        try {
            const node = instantiateNode(this, current.data, true);

            if (node) {
                this.nodes.set(node.id, node);
            }
        } catch (error) {}
    }

    deleteNode(id: string) {
        this.data.nodes.delete(id);
        this.nodes.delete(id);
    }

    addComputedConnections(origin: EntryId, target: EntryId) {
        this.#computedConnections[origin] = true;
        this.#computedConnections[target] = true;
        this.#linkedConnections.add(`${origin}-${target}`);
    }

    entryIsConnected(id: EntryId): boolean {
        return !!this.#computedConnections[id];
    }

    computeConnections(force?: boolean) {
        if (!force && this.#computed) return;

        this.#computed = true;
        this.#computedConnections = {};
        this.#linkedConnections.clear();

        for (const originNode of this.nodes) {
            const originConnections = R.pipe(
                [
                    ["outs", originNode.data.outs, originNode.entries.outs],
                    [
                        "inputs",
                        originNode.data.inputs,
                        isVariableGetterNode(originNode)
                            ? [] // we don't want to process variables getter input
                            : (originNode.exitGate?.entries.outputs ?? originNode.entries.inputs),
                    ],
                ] as const,
                R.flatMap(([category, records, entries]) => {
                    const schemas = entries.map((entry) => entry.schema);

                    return R.pipe(
                        R.entries(records),
                        R.map(([key, { connection }]) => {
                            if (!connection) return;

                            const entry = schemas.find(({ key }) => key === key);
                            if (!entry) return;

                            const type = ("type" in entry ? entry.type : "bridge") as string;
                            return [category, type, key, connection] as const;
                        }),
                        R.filter(R.isTruthy),
                    );
                }),
            );

            for (const [category, originType, originKey, otherId] of originConnections) {
                const [otherNodeId, otherCategory, otherEntryKey] = R.split(otherId, ":");
                const otherNode = this.getNode(otherNodeId);

                /**
                 * we delete stale connections for next save, this way we don't have to manually
                 * update every node when connections are removed
                 */
                const deleteData = () => {
                    for (const data of [originNode.data, originNode.data._source] as const) {
                        delete data[category]?.[originKey];
                    }
                };

                if (!otherNode) {
                    deleteData();
                    continue;
                }

                if (otherCategory === "ins") {
                    if (!otherNode.entries.in) {
                        deleteData();
                        continue;
                    }
                } else {
                    const output = otherNode.entries.outputs.find(({ schema: { key, type } }) => {
                        if (key !== otherEntryKey) return false;
                        return type === originType || !!this.application.getConvertor(type, originType);
                    });

                    if (!output) {
                        deleteData();
                        continue;
                    }
                }

                const inputCategory = otherCategory === "ins" ? "outs" : "inputs";
                const inputId: EntryId = `${originNode.id}:${inputCategory}:${originKey}`;

                this.addComputedConnections(inputId, otherId);
            }
        }
    }
}

interface OpenTrigger {
    get nodes(): Collection<OpenTriggerNode>;
}

export { OpenTrigger };
