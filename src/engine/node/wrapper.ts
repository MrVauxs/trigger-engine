import {
    BuiltInApplication,
    instantiateEntry,
    isBuiltInNode,
    NodeBridge,
    NodeEntry,
    OpenNodeEntry,
    Trigger,
    TriggerApplication,
} from "engine";
import { joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { NodeData, TriggerNode } from ".";

function instantiateNode(parent: Trigger, data: NodeData, open: true): OpenTriggerNode | undefined;
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

            const [inputs, outputs] = R.map(
                [
                    ["inputs", NodeCls.defineInputs],
                    ["outputs", NodeCls.defineOutputs],
                ] as const,
                ([category, schemas]) => {
                    const entries = R.pipe(
                        schemas ?? [],
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
                            } catch (error) {
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

            const rawOuts = NodeCls.outs || (isEvent ? "out" : []);
            const [ins, outs] = R.map(
                [
                    !isEvent && NodeCls.hasIn ? [{ key: "in" }] : [],
                    R.isString(rawOuts) ? [{ key: rawOuts }] : rawOuts,
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
    parent: Trigger;
}

type NodeEntries = {
    in: NodeBridge | null;
    inputs: Collection<OpenNodeEntry>;
    outputs: Collection<OpenNodeEntry>;
    outs: Collection<NodeBridge>;
};

export { instantiateNode, triggerNodeLocalize };
export type { OpenTriggerNode };
