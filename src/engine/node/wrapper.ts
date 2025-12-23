import {
    BridgeSchema,
    BuiltInApplication,
    InputEntrySchema,
    instantiateEntry,
    isBuiltInNode,
    NodeBridge,
    NodeEntry,
    OpenNodeEntry,
    OpenTrigger,
    Trigger,
    TriggerApplication,
} from "engine";
import { joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
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
        return triggerNodeLocalize(parent.application, NodeCls, ...args);
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
                    ["inputs", getInputsSchemas(NodeCls, nodeState)],
                    ["outputs", getOutputsSchemas(NodeCls, nodeState)],
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
                    getOutsSchemas(NodeCls, nodeState),
                ] as const,
                (schemas) => {
                    return R.pipe(
                        schemas,
                        R.map((schema) => {
                            try {
                                // // TODO we need to actually pass the data here
                                // const bridgeData = new NodeBridgeData({
                                //     key: schema.key,
                                // });
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

function filterSchemasByState<T extends { state?: string }>(
    schemas: T[],
    state: Maybe<string>
): T[] {
    return state ? schemas.filter((schema) => !schema.state || schema.state === state) : schemas;
}

// TODO this needs to also return custom outs
function getOutsSchemas(NodeCls: typeof TriggerNode, state?: Maybe<string>): BridgeSchema[] {
    const rawOuts = NodeCls.defineOuts || (NodeCls.isEvent ? "out" : []);
    return R.isString(rawOuts) ? [{ key: rawOuts }] : filterSchemasByState(rawOuts, state);
}

// TODO this needs to also return custom inputs
function getInputsSchemas(NodeCls: typeof TriggerNode, state?: Maybe<string>): InputEntrySchema[] {
    return filterSchemasByState(NodeCls.defineInputs ?? [], state);
}

// TODO this needs to also return custom inputs
function getOutputsSchemas(NodeCls: typeof TriggerNode, state?: Maybe<string>): InputEntrySchema[] {
    return filterSchemasByState(NodeCls.defineOutputs ?? [], state);
}

function getNodeStates(NodeCls: typeof TriggerNode): string[] | null {
    if (!R.isArray(NodeCls.states)) return null;

    const rawStates = NodeCls.states.filter((state) => R.isString(state));
    return rawStates.length >= 2 ? rawStates : null;
}

function triggerNodeLocalize(
    application: TriggerApplication,
    node: typeof TriggerNode,
    ...args: LocalizeArgs
): string | undefined {
    const AppCls = isBuiltInNode(node) ? BuiltInApplication : application;
    const data = R.isObjectType(args.at(-1)) ? (args.pop() as LocalizeData) : undefined;
    const path = joinStr(".", AppCls.localizePath, ...args);

    if (!game.i18n.has(path, true)) return;
    return R.isObjectType(data) ? game.i18n.format(path, data) : game.i18n.localize(path);
}

interface OpenTriggerNode extends TriggerNode {
    data: NodeData;
    entries: NodeEntries;
    parent: OpenTrigger;
    state: string | null;
    states: string[] | null;
}

type NodeEntries = {
    in: NodeBridge | null;
    inputs: Collection<OpenNodeEntry>;
    outputs: Collection<OpenNodeEntry>;
    outs: Collection<NodeBridge>;
};

export {
    getInputsSchemas,
    getNodeStates,
    getOutputsSchemas,
    getOutsSchemas,
    instantiateNode,
    triggerNodeLocalize,
};
export type { OpenTriggerNode };
