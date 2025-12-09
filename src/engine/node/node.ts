import {
    BridgeSchema,
    BuiltInApplication,
    InputEntrySchema,
    isBuiltInNode,
    NodeBridge,
    NodeBridgeData,
    NodeEntry,
    NodeEntryData,
    OutputEntrySchema,
    Trigger,
    TriggerApplication,
} from "engine";
import { joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { NodeData, NodeHeaderData } from ".";

// const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

class TriggerNode {
    #data: NodeData;
    #in: NodeBridge | null;
    #inputs: Collection<NodeEntry>;
    #outputs: Collection<NodeEntry>;
    #outs: Collection<NodeBridge>;
    #parent: Trigger;

    constructor(parent: Trigger, data: NodeData) {
        MODULE.assert(
            parent instanceof Trigger && !parent.invalid,
            "parent argument must be a valid 'Trigger'."
        );

        MODULE.assert(
            data instanceof NodeData && !data.invalid,
            "data argument must be a valid 'NodeData'."
        );

        this.#data = data;
        this.#parent = parent;

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
                    ["localize", this.#localize],
                    ["rootLocalize", this.#rootLocalize],
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
                    value: (this.constructor as typeof TriggerNode)[property],
                    configurable: false,
                    enumerable: true,
                    writable: false,
                };
            })
        );

        // entries

        const thisConstructor = this.constructor as typeof TriggerNode;

        const [inputs, outputs] = R.map(
            [thisConstructor.defineInputs, thisConstructor.defineOutputs] as const,
            (schemas) => {
                const entries = R.pipe(
                    schemas ?? [],
                    R.map((schema) => {
                        try {
                            const EntryCls = parent.application.entries.get(schema.type);
                            if (!EntryCls) return;

                            // TODO we need to actually pass the data here
                            const entryData = new NodeEntryData({
                                type: schema.type,
                                key: schema.key,
                            });
                            const entry = new EntryCls(this, schema, entryData);

                            return [entry.key, entry] as const;
                        } catch (error) {}
                    }),
                    R.filter(R.isTruthy)
                );

                return new Collection(entries);
            }
        );

        const rawOuts = thisConstructor.outs || (this.isEvent ? "out" : []);
        const [ins, outs] = R.map(
            [
                !this.isEvent && thisConstructor.hasIn ? [{ key: "in" }] : [],
                R.isString(rawOuts) ? [{ key: rawOuts }] : rawOuts,
            ] as const,
            (schemas) => {
                return R.pipe(
                    schemas,
                    R.map((schema) => {
                        try {
                            // TODO we need to actually pass the data here
                            const bridgeData = new NodeBridgeData({
                                key: schema.key,
                            });
                            const bridge = new NodeBridge(this, schema, bridgeData);

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

        Object.defineProperty(this, "_entries", {
            value: {
                in: this.#in,
                outs: this.#outs,
                inputs,
                outputs,
            } satisfies NodeEntries,
            configurable: false,
            enumerable: false,
            writable: false,
        });

        Object.freeze(this._entries);
    }

    //////////////////////////////
    // ABSTRACT STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Must be an unique key among your registered module's nodes
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.title`
     */
    static get type(): string {
        throw MODULE.Error("the 'type' static getter must be implemented.");
    }

    //////////////////////////////
    // STATIC ACCESSORS
    //////////////////////////////

    /**
     * Used to sort nodes in the triggers menu
     *
     * Localization path:
     * `<module-id>.<application-id>.category.<category>.title`
     */
    static get category(): string {
        return this.isEvent ? "event" : "node";
    }

    /**
     * Tags used to filter in the triggers menu.
     * Nodes are already displayed by `category` so this is only for extra filtering.
     *
     * Localization path:
     * `<module-id>.<application-id>.tag.<tag>.title`
     */
    static get tags(): string[] {
        return [];
    }

    /**
     * Define this as a trigger event node.
     *
     * Some functionalities will be excluded/overriden if `true`.
     */
    static get isEvent(): boolean {
        return false;
    }

    /**
     * @see {@link NodeEntry.fieldSchema}
     * Define the inputs for this node if any.
     */
    static get defineInputs(): InputEntrySchema[] | null {
        return null;
    }

    /**
     * Define the outputs for this node if any.
     */
    static get defineOutputs(): OutputEntrySchema[] | null {
        return null;
    }

    /**
     * Does this node have an `in` bridge connection.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.in`
     */
    static get hasIn(): boolean {
        return true;
    }

    /**
     * List of `out` bridge connections.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.out.<key>`
     */
    static get outs(): string | BridgeSchema[] | null {
        return "out";
    }

    /**
     * Adds an extra icon to the node to notify users of its special nature
     */
    static get canBreak(): boolean {
        return false;
    }

    /**
     * Adds an extra icon to the node to notify users of its special nature.
     */
    static get isLoop(): boolean {
        return false;
    }

    /**
     * Adds an extra icon to the node to notify users of its special nature
     */
    static get isAwait(): boolean {
        return false;
    }

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    /**
     * Data to represent the node's header in the triggers menu
     */
    get header(): NodeHeaderData | null {
        const application = this.#parent.application;
        const node = this.constructor as typeof TriggerNode;

        return {
            background: this.isEvent ? "#C40000" : "#000000",
            title: localizeNodeProperty(application, node, "type"),
            subtitle:
                this.localize("subtitle") ?? localizeNodeProperty(application, node, "category"),
        };
    }

    //////////////////////////////
    // IMMUTABLE METHODS
    //////////////////////////////

    /**
     * Calls the next `executeable` node in the chain.
     *
     * @param out key of the selected `out` bridge
     *
     * @example
     * return this.executeNext("out")
     *
     * @example
     * return this.executeNext("true")
     *
     * @see {@link TriggerNode#execute}
     */
    declare readonly executeNext: (out: string) => Promise<boolean>;

    /**
     * Retrieve the computed value from one of this node's inputs.
     *
     * @param input key of the `input` from which you want to retrieve the value.
     *
     * If no connection exist with the input or the returned value is incompatible with its type,
     * then the default value is returned instead.
     *
     * @example
     * const number = await this.get("number");
     *
     * @see {@link TriggerNode#execute}
     */
    declare readonly getInputValue: (input: string) => Promise<any>;

    /**
     * Localization helper with pre-defined path and optional (last argument) data object for `game.i18n.format`
     *
     * It points directly to the path:
     * `<module-id>.<application-id>.node.<category>.<type>.<...path>`
     *
     * @returns undefined if no key exist at that path
     */
    declare readonly localize: (...args: LocalizeArgs) => string | undefined;

    /**
     * @see {@link TriggerNode#localize}
     *
     * It points directly to the path:
     * `<module-id>.<application-id>.<...path>`
     *
     * @returns undefined if no key exist at that path
     */
    declare readonly rootLocalize: (...args: LocalizeArgs) => string | undefined;

    /**
     * Set the value for one of this node's outputs.
     *
     * @param output key of the `output` to set
     *
     * @see {@link TriggerNode#execute}
     */
    declare readonly setOutputValue: (output: string) => void;

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    /**
     * @abstract
     *
     * A node with `in` or `outs` is considered an `executeable` node.
     *
     * This method is called by by a previous node that have `outs`.
     *
     * @param options is only provided to `event` nodes by the calling `TriggerHook`.
     *
     * @returns `false` if you want to break out of the last `loop`.
     *
     * @see {@link TriggerNode#executeNext}
     * @see {@link TriggerNode#getInputValue}
     * @see {@link TriggerNode#setOutputValue}
     */
    async execute(options?: Record<string, any>): Promise<boolean> {
        throw MODULE.Error("the 'execute' method must be implemented for `executeable` nodes.");
    }

    /**
     * @abstract
     * A node without 'in' nor 'outs' is considered a `query` node.
     *
     * @param key is the key of the output entry that was requested by the other node.
     *
     * @returns the computed value of the output type requested by the other node.
     * If the returned value isn't compatible with the connection type, the default value will be instead be returned.
     */
    async query(key: string): Promise<any> {
        throw MODULE.Error("the 'query' method must be implemented for `query` nodes.");
    }

    //////////////////////////////
    // PRIVATE METHODS
    //////////////////////////////

    #localize(...args: LocalizeArgs): string | undefined {
        return this.#rootLocalize("node", this.category, this.type, ...args);
    }

    #rootLocalize(...args: LocalizeArgs): string | undefined {
        const NodeCls = this.constructor as typeof TriggerNode;
        return triggerNodeLocalize(this.#parent.application, NodeCls, ...args);
    }
}

interface TriggerNode
    extends Pick<NodeData, "id" | "invalid">,
        Pick<typeof TriggerNode, "category" | "isEvent" | "type"> {
    _entries: NodeEntries;
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

function localizeNodeTag(
    application: TriggerApplication,
    node: typeof TriggerNode,
    tag: string
): string {
    return triggerNodeLocalize(application, node, "tag", tag, "title") ?? tag;
}

function localizeNodeProperty(
    application: TriggerApplication,
    node: typeof TriggerNode,
    property: TriggerNodeStringProperty
): string {
    const path = getNodePropertyLocalizePath(node, property);
    return triggerNodeLocalize(application, node, path) ?? node[property];
}

function getNodePropertyLocalizePath(
    node: typeof TriggerNode,
    property: TriggerNodeStringProperty
): string {
    switch (property) {
        case "category": {
            return `category.${node.category}.title`;
        }

        case "type": {
            return `node.${node.category}.${node.type}.title`;
        }
    }
}

type TriggerNodeStringProperty = keyof {
    [P in keyof typeof TriggerNode as (typeof TriggerNode)[P] extends string
        ? P
        : never]: (typeof TriggerNode)[P];
};

type NodeEntries = {
    in: NodeBridge | null;
    inputs: Collection<NodeEntry>;
    outputs: Collection<NodeEntry>;
    outs: Collection<NodeBridge>;
};

export { localizeNodeProperty, localizeNodeTag, TriggerNode, triggerNodeLocalize };
export type { TriggerNodeStringProperty };
