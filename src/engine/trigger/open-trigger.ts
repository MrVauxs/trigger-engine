import {
    CreateNodeData,
    getInputsSchemas,
    getOutputsSchemas,
    getOutsSchemas,
    instantiateNode,
    OpenTriggerNode,
    Trigger,
    TriggerApplication,
    TriggerData,
    TriggerDataSource,
    TriggerNode,
    UpdateNodeData,
    UpdateTriggerData,
} from "engine";
import { enrichHTML, MODULE, R } from "module-helpers";
import { EntryId, TwoWaysEntryId } from "triggers-menu";

class OpenTrigger extends Trigger<OpenTriggerNode> {
    #computed: boolean = false;
    #computedConnections: Record<EntryId, boolean> = {};
    #linkedConnections: Set<TwoWaysEntryId> = new Set();

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
        this.data.removeNode(id);
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

        for (const inputNode of this.nodes) {
            const InputNodeCls = inputNode.constructor as typeof TriggerNode;
            const nodeInputs = getInputsSchemas(InputNodeCls, inputNode.state);

            const ins = R.pipe(
                R.values(inputNode.data.ins),
                R.map(({ connections }) => ["ins", "bridge", "in", connections] as const)
            );

            const inputs = R.pipe(
                R.entries(inputNode.data.inputs),
                R.map(([inputKey, { connections }]) => {
                    const input = nodeInputs.find(({ key }) => key === inputKey);
                    if (!R.isObjectType(input) || !R.isString(input.type)) return;

                    return ["inputs", input.type, inputKey, connections] as const;
                }),
                R.filter(R.isTruthy)
            );

            const inputConnections = R.pipe(
                [...ins, ...inputs],
                R.flatMap(([category, type, key, connections]) => {
                    if (!connections?.length) return;
                    return connections.map(
                        (connection) => [category, type, key, connection] as const
                    );
                }),
                R.filter(R.isTruthy)
            );

            for (const [category, inputType, inputKey, outputId] of inputConnections) {
                const [outputNodeId, outputCategory, outputEntryKey] = R.split(outputId, ":");
                const outputNode = this.getNode(outputNodeId);

                /**
                 * we delete stale connections for next save this way we don't have to maunally
                 * update every node when connections are removed (from deleting nodes or disconnecting)
                 */
                const deleteData = () => {
                    for (const data of [inputNode.data, inputNode.data._source] as const) {
                        const connections = data[category]?.[inputKey]?.connections;

                        connections?.findSplice((connection) => connection === outputId);

                        if (!connections?.length) {
                            delete data[category]?.[inputKey];
                        }
                    }
                };

                if (!outputNode) {
                    deleteData();
                    continue;
                }

                const OutputNodeCls = outputNode.constructor as typeof TriggerNode;

                if (outputCategory === "outs") {
                    const outs = getOutsSchemas(OutputNodeCls, outputNode.state);
                    const out = outs.find(({ key }) => key === outputEntryKey);

                    if (!out) {
                        deleteData();
                        continue;
                    }
                } else {
                    const outputs = getOutputsSchemas(OutputNodeCls, outputNode.state);
                    const output = outputs.find(({ key, type }) => {
                        return (
                            key === outputEntryKey &&
                            (type === inputType || !!this.application.getConvertor(type, inputType))
                        );
                    });

                    if (!output) {
                        deleteData();
                        continue;
                    }
                }

                const inputCategory = outputCategory === "outs" ? "ins" : "inputs";
                const inputId: EntryId = `${inputNode.id}:${inputCategory}:${inputKey}`;

                this.addComputedConnections(inputId, outputId);
            }
        }
    }
}

export { OpenTrigger };
