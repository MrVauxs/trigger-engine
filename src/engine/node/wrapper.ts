import {
    instantiateEntry,
    isGateEntryNode,
    isVariableGetterNode,
    NodeBridge,
    NodeEntry,
    OpenNodeEntry,
    OpenTrigger,
    OutputEntrySchema,
    Trigger,
} from "engine";
import { LocalizeArgs, MODULE, R } from "module-helpers";
import {
    getInputsSchemas,
    getNodeStates,
    getOutputsSchemas,
    getOutsSchemas,
    NodeData,
    TriggerNode,
} from ".";

function instantiateNode(
    parent: OpenTrigger,
    data: NodeData,
    open: true
): OpenTriggerNode | undefined;
function instantiateNode(parent: Trigger, data: NodeData, open: boolean): TriggerNode | undefined;
function instantiateNode(
    parent: Trigger,
    nodeData: NodeData,
    open: boolean
): TriggerNode | OpenTriggerNode | undefined {
    const NodeCls = parent.application.nodes.get(nodeData.type) as typeof TriggerNode;
    if (!NodeCls) return;

    // we retrieve the exit-gate if we are an entry-gate
    const isGateEntry = isGateEntryNode(nodeData);
    const exitGate: { node: TriggerNode; schemas: OutputEntrySchema[] } | undefined = (() => {
        if (!isGateEntry) return;

        const connection = nodeData.outs.out.connection;
        const nodeId = connection?.split(":").at(0) ?? "";
        const node = parent.nodes.get(nodeId);
        const data = foundry.utils.deepClone(parent.data.nodes.get(nodeId));
        if (!node || !data) return;

        const ExitCls = node.constructor as typeof TriggerNode;
        const schemas = getOutputsSchemas(ExitCls, { data });

        return { node, schemas };
    })();
    if (isGateEntry && !exitGate) return;

    // we construct the variable schema
    const isVariableGetter = isVariableGetterNode(nodeData);
    const variableSchemas = ((): OutputEntrySchema[] | undefined => {
        if (!isVariableGetter) return;

        const connection = nodeData.inputs.in.connection;
        const data = connection && parent.data.variables[connection];
        if (!data) return;

        return [
            {
                isArray: data.isArray,
                key: "entry",
                label: data.label,
                type: data.type,
            },
        ];
    })();
    if (isVariableGetter && !variableSchemas) return;

    function rootLocalize(...args: LocalizeArgs): string | undefined {
        return parent.application.localize(...args);
    }

    function localize(...args: LocalizeArgs): string | undefined {
        return rootLocalize("node", NodeCls.category, NodeCls.type, ...args);
    }

    const isEvent = NodeCls.isEvent;

    //states
    const nodeStates = getNodeStates(NodeCls);
    const nodeState = !nodeStates
        ? null
        : R.isString(nodeData.state) && R.isIncludedIn(nodeData.state, nodeStates)
        ? nodeData.state
        : nodeStates[0];

    class TriggerNodeWrapper extends NodeCls {
        #in: NodeBridge | null;
        #inputs: Collection<NodeEntry>;
        #outputs: Collection<NodeEntry>;
        #outs: Collection<NodeBridge>;

        constructor() {
            super();

            // from data accessors
            Object.defineProperties(
                this,
                R.fromKeys(["id", "invalid"] as const, (property) => {
                    return {
                        value: nodeData[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                })
            );

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["localize", localize],
                        ["rootLocalize", rootLocalize],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    })
                )
            );

            // from static accessors
            Object.defineProperties(
                this,
                R.fromKeys(["isEvent", "type", "category"] as const, (property) => {
                    return {
                        value: NodeCls[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                })
            );

            // bridges
            const [ins, outs] = R.map(
                [
                    !isEvent && NodeCls.hasIn ? [{ key: "in", state: undefined }] : [],
                    getOutsSchemas(NodeCls, { data: nodeData, state: nodeState }),
                ] as const,
                (schemas) => {
                    return R.pipe(
                        schemas,
                        R.map((schema) => {
                            try {
                                const bridge = new NodeBridge(parent, this, schema);
                                return [bridge.key, bridge] as const;
                            } catch (error) {}
                        }),
                        R.filter(R.isTruthy)
                    );
                }
            );

            // entries
            const [inputs, outputs] = R.map(
                [
                    [
                        "inputs",
                        variableSchemas ?? // unique schema for variables
                            exitGate?.schemas ?? // we use the exit output schemas
                            getInputsSchemas(NodeCls, { data: nodeData, state: nodeState }),
                    ],
                    [
                        "outputs",
                        variableSchemas ?? // unique schema for variables
                            getOutputsSchemas(NodeCls, { data: nodeData, state: nodeState }),
                    ],
                ] as const,
                ([category, schemas]) => {
                    const entries = R.pipe(
                        schemas,
                        R.map((schema) => {
                            try {
                                const entry = instantiateEntry(
                                    parent,
                                    this,
                                    category,
                                    schema,
                                    nodeData,
                                    open
                                );

                                return entry ? ([entry.key, entry] as const) : undefined;
                            } catch (error: any) {
                                MODULE.error(
                                    "an error occured while instantiating a node entry",
                                    error
                                );
                            }
                        }),
                        R.filter(R.isTruthy)
                    );

                    return new Collection(entries);
                }
            );

            this.#in = ins.at(0)?.[1] || null;
            this.#outs = new Collection(outs);
            this.#inputs = inputs;
            this.#outputs = outputs;

            if (open) {
                Object.defineProperties(this, {
                    data: {
                        value: nodeData,
                    },
                    entries: {
                        value: {
                            in: this.#in,
                            outs: this.#outs,
                            inputs: inputs as Collection<OpenNodeEntry>,
                            outputs: outputs as Collection<OpenNodeEntry>,
                        } satisfies NodeEntries,
                    },
                    exitGate: {
                        value: exitGate?.node,
                    },
                    parent: {
                        value: parent,
                    },
                    state: {
                        value: nodeState,
                    },
                    states: {
                        value: nodeStates,
                    },
                    tags: {
                        value: NodeCls.tags,
                    },
                });
            }
        }
    }

    interface TriggerNodeWrapper {
        _execute(options?: Record<string, any>): Promise<boolean>;
        _query(key: string): Promise<any>;
    }

    return new TriggerNodeWrapper();
}

interface OpenTriggerNode extends TriggerNode {
    data: NodeData;
    entries: NodeEntries;
    exitGate: OpenTriggerNode | undefined;
    parent: OpenTrigger;
    state: string | null;
    states: string[] | null;
    tags: string[];
}

type NodeEntries = {
    in: NodeBridge | null;
    inputs: Collection<OpenNodeEntry>;
    outputs: Collection<OpenNodeEntry>;
    outs: Collection<NodeBridge>;
};

export { instantiateNode };
export type { OpenTriggerNode };
