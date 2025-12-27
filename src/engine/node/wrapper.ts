import {
    BaseEntrySchema,
    BridgeSchema,
    InputEntrySchema,
    instantiateEntry,
    NodeBridge,
    NodeEntry,
    OpenNodeEntry,
    OpenTrigger,
    OutputEntrySchema,
    Trigger,
} from "engine";
import { LocalizeArgs, MODULE, R } from "module-helpers";
import { NodeData, TriggerNode } from ".";

function instantiateNode(
    parent: OpenTrigger,
    data: NodeData,
    open: true
): OpenTriggerNode | undefined;
function instantiateNode(parent: Trigger, data: NodeData, open: boolean): TriggerNode | undefined;
function instantiateNode(
    parent: Trigger,
    data: NodeData,
    open: boolean
): TriggerNode | OpenTriggerNode | undefined {
    const NodeCls = parent.application.nodes.get(data.type) as typeof TriggerNode;
    if (!NodeCls) return;

    function rootLocalize(...args: LocalizeArgs): string | undefined {
        return parent.application.localize(...args);
    }

    function localize(...args: LocalizeArgs): string | undefined {
        return rootLocalize("node", NodeCls.category, NodeCls.type, ...args);
    }

    const nodeStates = getNodeStates(NodeCls);
    const nodeState = !nodeStates
        ? null
        : R.isString(data.state) && R.isIncludedIn(data.state, nodeStates)
        ? data.state
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
                        value: data[property],
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

            // entries

            const isEvent = NodeCls.isEvent;

            // TODO also add customs
            const [inputs, outputs] = R.map(
                [
                    ["inputs", getInputsSchemas(NodeCls, { data, state: nodeState })],
                    ["outputs", getOutputsSchemas(NodeCls, { data, state: nodeState })],
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
                                    data,
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

            const [ins, outs] = R.map(
                [
                    !isEvent && NodeCls.hasIn ? [{ key: "in", state: undefined }] : [],
                    getOutsSchemas(NodeCls, { state: nodeState }),
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

            this.#in = ins.at(0)?.[1] || null;
            this.#outs = new Collection(outs);
            this.#inputs = inputs;
            this.#outputs = outputs;

            if (open) {
                Object.defineProperties(this, {
                    data: {
                        value: data,
                    },
                    entries: {
                        value: {
                            in: this.#in,
                            outs: this.#outs,
                            inputs: inputs as Collection<OpenNodeEntry>,
                            outputs: outputs as Collection<OpenNodeEntry>,
                        } satisfies NodeEntries,
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
                });
            }
        }
    }

    interface TriggerNodeWrapper {
        execute(options?: Record<string, any>): Promise<boolean>;
        query(key: string): Promise<any>;
    }

    return new TriggerNodeWrapper();
}

interface OpenTriggerNode extends TriggerNode {
    data: NodeData;
    entries: NodeEntries;
    parent: OpenTrigger;
    state: string | null;
    states: string[] | null;
}

function filterSchemasByState<T extends { state?: string }>(
    schemas: T[],
    { state }: { state?: string | null } = {}
): T[] {
    return state ? schemas.filter((schema) => !schema.state || schema.state === state) : schemas;
}

function filterEntrySchemas<T extends BaseEntrySchema>(
    schemas: T[],
    options: Exclude<SchemasEntriesFilterOptions, "data">
): T[] {
    return filterSchemasByState(schemas, options).filter((schema) => {
        return (
            !schema.hidden || options?.revealed === true || options?.revealed?.[schema.key] === true
        );
    });
}

// TODO this needs to also return custom outs
function getOutsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasFilterOptions
): BridgeSchema[] {
    const rawOuts = NodeCls.defineOuts || (NodeCls.isEvent ? "out" : []);
    return R.isString(rawOuts) ? [{ key: rawOuts }] : filterSchemasByState(rawOuts, options);
}

// TODO this needs to also return custom inputs
function getInputsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasEntriesFilterOptions
): InputEntrySchema[] {
    return filterEntrySchemas(NodeCls.defineInputs ?? [], {
        revealed: options?.revealed ?? options?.data?.revealed?.inputs,
        state: options?.state,
    });
}

// TODO this needs to also return custom inputs
function getOutputsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasEntriesFilterOptions
): OutputEntrySchema[] {
    return filterEntrySchemas(NodeCls.defineOutputs ?? [], {
        revealed: options?.revealed ?? options?.data?.revealed?.outputs,
        state: options?.state,
    });
}

function getNodeStates(NodeCls: typeof TriggerNode): string[] | null {
    if (!R.isArray(NodeCls.states)) return null;

    const rawStates = NodeCls.states.filter((state) => R.isString(state));
    return rawStates.length >= 2 ? rawStates : null;
}

type NodeEntries = {
    in: NodeBridge | null;
    inputs: Collection<OpenNodeEntry>;
    outputs: Collection<OpenNodeEntry>;
    outs: Collection<NodeBridge>;
};

type SchemasFilterOptions = {
    state?: string | null;
};

type SchemasEntriesFilterOptions = SchemasFilterOptions & {
    data?: NodeData;
    revealed?: true | Record<string, boolean>;
};

export { getInputsSchemas, getNodeStates, getOutputsSchemas, getOutsSchemas, instantiateNode };
export type { OpenTriggerNode };
