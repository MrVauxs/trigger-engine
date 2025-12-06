import {
    BaseNodeInput,
    BaseNodeOutput,
    BuiltInApplication,
    isBuiltInNode,
    Trigger,
    TriggerApplication,
} from "engine";
import { joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { NodeData } from ".";

const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

class TriggerNode {
    #data: NodeData;
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

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    /**
     * Does this node have an `in` bridge connection
     */
    get hasIn(): boolean {
        return true;
    }

    /**
     * List of `out` bridge connections
     */
    get outs(): string | NodeOut[] | null {
        return "out";
    }

    /**
     * Data to represent the node's header in the triggers menu
     */
    get header(): NodeHeaderSource | null {
        const application = this.#parent.parent;
        const node = this.constructor as typeof TriggerNode;

        return {
            background: this.isEvent ? "#C40000" : "#000000",
            title: localizeNodeProperty(application, node, "type"),
            subtitle:
                this.localize("subtitle") ?? localizeNodeProperty(application, node, "category"),
        };
    }

    get inputsSchemas(): BaseNodeInput<string>[] | null {
        return null;
    }

    get outputsSchemas(): BaseNodeOutput<string>[] | null {
        return null;
    }

    get customData(): NodeCustomData[] | null {
        return null;
    }

    /**
     * Adds an extra icon to the node to notify users of its special nature
     */
    get canLoop(): boolean {
        return false;
    }

    /**
     * Adds an extra icon to the node to notify users of its special nature
     */
    get canBreak(): boolean {
        return false;
    }

    /**
     * Adds an extra icon to the node to notify users of its special nature
     */
    get isAwait(): boolean {
        return false;
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
     */
    declare readonly localize: (...args: LocalizeArgs) => string | undefined;

    /**
     * @see {@link TriggerNode#localize}
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
        return triggerNodeLocalize(this.#parent.parent, NodeCls, ...args);
    }
}

interface TriggerNode
    extends Pick<NodeData, "id" | "invalid">,
        Pick<typeof TriggerNode, "category" | "isEvent" | "type"> {}

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

type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

type NodeCustomEntryCategory = NodeEntryCategory | "outs";

type NodeHeaderSource = {
    background?: `#${string}` | number;
    icon?: NodeIconObject | string;
    title?: string;
    subtitle?: string;
};

type NodeCustomData = {
    category: NodeCustomEntryCategory;
    group: string;
    key: NodeCustomDataKey;
    types: string[];
};

type NodeIconObject = {
    unicode?: string;
    fontSize?: number;
    fontWeight?: TextStyleFontWeight;
};

type NodeCustomDataKey = {
    label: boolean;
    name: string;
    prefix: string | undefined;
    required: boolean;
    type: "number" | "text";
};

type NodeOut = {
    key: string;
    label?: string;
};

export { localizeNodeProperty, localizeNodeTag, TriggerNode, triggerNodeLocalize };
export type { NodeHeaderSource, NodeIconObject, TriggerNodeStringProperty };
