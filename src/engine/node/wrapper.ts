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
import { LocalizeArgs, MODULE, R, UserPF2e } from "module-helpers";
import { getInputsSchemas, getNodeStates, getOutputsSchemas, getOutsSchemas, NodeData, TriggerNode } from ".";

function instantiateNode(parent: OpenTrigger, data: NodeData, open: true): OpenTriggerNode | undefined;
function instantiateNode<TNode extends TriggerNode>(parent: Trigger, data: NodeData, open: boolean): TNode | undefined;
function instantiateNode(
    parent: Trigger,
    nodeData: NodeData,
    open: boolean,
): TriggerNode | OpenTriggerNode | undefined {
    const NodeCls = parent.application.nodes.get(nodeData.type) as typeof TriggerNode;
    if (!NodeCls) return;

    // we retrieve the exit-gate if we are an entry-gate
    const isGateEntry = isGateEntryNode(nodeData);
    const exitGate: { node: TriggerNode; schemas: OutputEntrySchema[] } | undefined = (() => {
        if (!isGateEntry) return;

        const connection = nodeData.outs.out.connection;
        const nodeId = connection?.split(":").at(0) ?? "";
        const node = parent.getNode(nodeId);
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

        const connection = nodeData.inputs.entry?.connection;
        const data = connection && parent.data.variables[connection];
        if (!data) return;

        const [nodeId, _, key] = connection.split(":");
        const node = parent.getNode(nodeId) as OpenTriggerNode | TriggerNode | undefined;
        if (!node || ("entries" in node && !node.entries.outputs.get(key))) return;

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
        #outputValues: Record<string, any> = {};
        #outs: Collection<NodeBridge>;
        #userId?: string;

        constructor() {
            super();

            const self = this;

            Object.defineProperty(this, "userContext", {
                get(): UserPF2e {
                    return (self.#userId && game.users.get(self.#userId)) || parent.userContext;
                },
                set(value) {
                    self.#userId = value.id;
                    parent.userContext = value.id;
                },
                configurable: false,
                enumerable: true,
            });

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
                }),
            );

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["getInputValue", this.#getInputValue],
                        ["getCustomInputs", this.#getCustomInputs],
                        ["getCustomInputsValues", this.#getCustomInputsValues],
                        ["getOutputValue", this.#getOutputValue],
                        ["executeNext", this.#executeNext],
                        ["localize", localize],
                        ["rootLocalize", rootLocalize],
                        ["setOutputValue", this.#setOutputValue],
                        ["setCustomOutputValues", this.#setCustomOutputValues],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    }),
                ),
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
                }),
            );

            // from application
            Object.defineProperties(
                this,
                R.fromKeys(
                    [
                        "convertFromEmitable",
                        "convertToEmitable",
                        "convertValuesFomEmitable",
                        "convertValuesToEmitable",
                        "parseUserValue",
                        "parseUserValues",
                    ] as const,
                    (property) => {
                        return {
                            value: parent.application[property].bind(parent.application),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    },
                ),
            );

            // bridges
            const [ins, outs] = R.map(
                [
                    ["inputs", !isEvent && NodeCls.hasIn ? [{ key: "in", state: undefined }] : []],
                    ["outputs", getOutsSchemas(NodeCls, { data: nodeData, state: nodeState })],
                ] as const,
                ([category, schemas]) => {
                    return R.pipe(
                        schemas,
                        R.map((schema) => {
                            try {
                                const bridge = new NodeBridge(category, nodeData, schema);
                                return [bridge.key, bridge] as const;
                            } catch (error) {}
                        }),
                        R.filter(R.isTruthy),
                    );
                },
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
                                const entry = instantiateEntry(parent, this, category, schema, nodeData, open);

                                return entry ? ([entry.key, entry] as const) : undefined;
                            } catch (error: any) {
                                MODULE.error("an error occurred while instantiating a node entry", error);
                            }
                        }),
                        R.filter(R.isTruthy),
                    );

                    return new Collection(entries);
                },
            );

            // some properties
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["nodePath", `${parent.path}:${this.id}`],
                        ["state", nodeState],
                        ["triggerPath", parent.path],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((value) => {
                        return {
                            value,
                            configurable: false,
                            enumerable: true,
                            writable: false,
                        };
                    }),
                ),
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
                    states: {
                        value: nodeStates,
                    },
                    tags: {
                        value: NodeCls.tags,
                    },
                });
            }
        }

        get #isExecutable(): boolean {
            return !!this.#in || this.#outs.size > 0;
        }

        async #executeNext(out: string, ...args: any[]): Promise<boolean> {
            if (!this.#isExecutable) return true;

            try {
                const connection = this.#outs.get(out)?.connection;
                if (!connection) return true;

                const node = parent.getNodeFromEntryId(connection);
                if (!node) return true;

                // we set the trigger context to the node's whenever it is executed
                parent.userContext = node.userContext;
                return node._execute(...args);
            } catch (error: any) {
                MODULE.error(`an error occurred while executing the node: ${this.nodePath}`, error);
                return true;
            }
        }

        async #getInputValue(key: string): Promise<any> {
            const input = this.#inputs.get(key);
            if (!input) return;

            const returnValue = (rawValue: any): any => {
                if (input.isArray) {
                    return R.pipe(
                        R.isArray(rawValue) ? rawValue : [rawValue],
                        R.filter(input.isValidType.bind(input)),
                        R.map(input.processValue.bind(input)),
                    );
                } else {
                    const value = R.isArray(rawValue) ? rawValue[0] : rawValue;
                    return input.isValidType(value) ? input.processValue(value) : input.default;
                }
            };

            if (input.connection) {
                const [nodeId, _, otherKey] = R.split(input.connection, ":");
                const otherNode = parent.getNode(nodeId) as TriggerNodeWrapper | undefined;

                if (!otherNode) {
                    return input.default;
                }

                const value = await otherNode.getOutputValue(otherKey, input);
                return returnValue(value);
            } else {
                return returnValue(input.value);
            }
        }

        #getCustomInputs(slug: string): Promise<{ label: string; value: any }[]> {
            const results = this.#inputs
                .filter((input) => input.slug === slug)
                .map(async ({ key, label }): Promise<{ label: string; value: any }> => {
                    return {
                        label: label ?? "",
                        value: await this.getInputValue(key),
                    };
                });

            return Promise.all(results);
        }

        #getCustomInputsValues(slug: string): Promise<any[]> {
            const results = this.#inputs
                .filter((input) => input.slug === slug)
                .map(async ({ key }) => this.getInputValue(key));

            return Promise.all(results);
        }

        async #getOutputValue(key: string, input: NodeEntry): Promise<any> {
            const output = this.#outputs.get(key);
            if (!output) return;

            const value = await (this.#isExecutable ? this.#outputValues[key] : this._query(key));

            if (output.type === input.type) {
                return value;
            }

            const convertor = parent.application.getConvertor(output.type, input.type);
            if (!convertor || !output.isValidType(value)) return;

            return R.isArray(value)
                ? await Promise.all(value.map(convertor.convertToInput.bind(convertor)))
                : await convertor.convertToInput(value);
        }

        #setOutputValue(key: string, value: any) {
            const output = this.#outputs.get(key);
            if (output) {
                this.#castAndSetOutputValue(output, value);
            }
        }

        #setCustomOutputValues(slug: string, values: any[]) {
            const outputs = this.#outputs.filter((output) => output.slug === slug);

            for (let i = 0; i < outputs.length; i++) {
                const output = outputs[i];
                this.#castAndSetOutputValue(output, values[i]);
            }
        }

        #castAndSetOutputValue(output: NodeEntry, value: any) {
            if (output.isArray) {
                this.#outputValues[output.key] = R.pipe(
                    R.isArray(value) ? value : [value],
                    R.map(output.castValue.bind(output)),
                );
            } else {
                value = R.isArray(value) ? value[0] : value;
                this.#outputValues[output.key] = output.castValue(value);
            }
        }
    }

    interface TriggerNodeWrapper {
        getOutputValue(key: string, input: NodeEntry): Promise<any>;
    }

    return new TriggerNodeWrapper();
}

interface OpenTriggerNode extends TriggerNode {
    data: NodeData;
    entries: NodeEntries;
    exitGate: OpenTriggerNode | undefined;
    parent: OpenTrigger;
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
