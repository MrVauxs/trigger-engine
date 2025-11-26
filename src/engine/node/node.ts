import { Trigger, TriggerData } from "engine";
import { joinStr, localize, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { NodeData, NodeDataSource } from ".";

const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;
const NODE_ENTRY_TYPES = ["boolean", "number", "text"] as const;
const NODE_CUSTOM_ENTRY_TYPES = NODE_ENTRY_TYPES;
const NODE_INPUT_TEXT_TYPES = ["code", "description", "text"] as const;

class TriggerNode {
    #data: NodeData;
    #parent: Trigger;

    constructor(parent: Trigger, data: NodeData) {
        MODULE.assert(
            data instanceof NodeData && !data.invalid,
            "data argument must be a valid 'NodeData'."
        );

        this.#data = data;
        this.#parent = parent;

        Object.defineProperties(
            this,
            R.mapValues(
                {
                    id: data.id,
                    module: data.module,
                },
                (value) => {
                    return {
                        value,
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                }
            )
        );

        Object.defineProperties(
            this,
            R.pipe(
                [
                    ["localize", this.#localize],
                    ["rootLocalize", this.#rootLocalize],
                    ["toObject", this.#toObject],
                ] as const,
                R.mapToObj(([property, method]) => {
                    return [
                        property,
                        {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        },
                    ];
                })
            )
        );

        Object.defineProperties(
            this,
            R.pipe(
                ["isEvent", "type", "category", "systems"] as const,
                R.mapToObj((property) => {
                    return [
                        property,
                        {
                            value: (this.constructor as typeof TriggerNode)[property],
                            configurable: false,
                            enumerable: true,
                            writable: false,
                        },
                    ];
                })
            )
        );

        Object.seal(this.systems);
    }

    //////////////////////////////
    // STATIC ACCESSORS
    //////////////////////////////

    /**
     * Used to sort nodes in the triggers menu
     */
    static get category(): string {
        return this.isEvent ? "event" : "";
    }

    //////////////////////////////
    // ABSTRACT STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Must be an unique key among your module's nodes
     */
    static get type(): string {
        throw MODULE.Error("the 'type' static getter must be implemented.");
    }

    /**
     * @abstract
     * List of ID of systems this node can operate on
     */
    static get systems(): string[] {
        throw MODULE.Error("the 'systems' static getter must be implemented.");
    }

    /**
     * Define this as a trigger event node.
     *
     * Some getters will be overriden if `true`.
     */
    static get isEvent(): boolean {
        throw MODULE.Error("the 'isEvent' static getter must be implemented.");
    }

    //////////////////////////////
    // IMMUTABLE PROPERTIES
    //////////////////////////////

    /**
     * @see {@link TriggerNode.category}
     */
    declare readonly category: string;

    /**
     * @see {@link TriggerData#id}
     */
    declare readonly id: string;

    /**
     * @see {@link TriggerNode.isEvent}
     */
    declare readonly isEvent: boolean;

    /**
     * @see {@link NodeDataSource.module}
     */
    declare readonly module: string;

    /**
     * @see {@link TriggerNode.systems}
     */
    declare readonly systems: string[];

    /**
     * @see {@link TriggerNode.type}
     */
    declare readonly type: string;

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
        const isEvent = this.isEvent;
        const category = this.category;

        return {
            background: isEvent ? "#c40000" : "#000000",
            title: this.localize("title") ?? this.type,
            subtitle:
                isEvent && category === "event"
                    ? localize("category.event.title")
                    : this.rootLocalize("category", category, "title") ?? category,
        };
    }

    get inputs(): NodeInput[] | null {
        return null;
    }

    get outputs(): NodeOutput[] | null {
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

    /**
     * Filters used in the triggers menu
     */
    get filters(): string[] {
        return [this.category];
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

    /**
     * Returns the source of this `NodeData`
     */
    declare readonly toObject: () => NodeDataSource;

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

    #toObject(): NodeDataSource {
        return this.#data.toObject();
    }

    #localize(...args: LocalizeArgs): string | undefined {
        const { data, path } = this.#getLocalizeData("node", this.category, this.type, ...args);
        return game.i18n.has(path, true) ? this.#localizeOrFormat(path, data) : undefined;
    }

    #rootLocalize(...args: LocalizeArgs): string | undefined {
        const { data, path } = this.#getLocalizeData(...args);
        return this.#localizeOrFormat(path, data);
    }

    #getLocalizeData(...args: LocalizeArgs) {
        const data = R.isObjectType(args.at(-1)) ? (args.pop() as LocalizeData) : undefined;
        const path = joinStr(".", this.module, ...args);
        return { path, data };
    }

    #localizeOrFormat(path: string, data?: LocalizeData): string {
        return R.isObjectType(data) ? game.i18n.format(path, data) : game.i18n.localize(path);
    }
}

type NodeInput = ValueOf<NodeInputs>;

type NodeOutput = BaseNodeEntry;

type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

type NodeCustomEntryCategory = NodeEntryCategory | "outs";

type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];

type NodeCustomEntryType = (typeof NODE_CUSTOM_ENTRY_TYPES)[number];

type NodeHeaderSource = {
    background?: `#${string}`;
    icon?: IconObject;
    title: string;
    subtitle?: string;
};

type NodeCustomData = {
    category: NodeCustomEntryCategory;
    group: string;
    key: NodeCustomDataKey;
    types: NodeCustomEntryType[];
};

type IconObject = {
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

type NodeInputs = {
    boolean: NodeBooleanEntry;
    number: NodeNumberEntry;
    text: NodeTextEntry;
};

type NodeNumberEntry = BaseNodeEntry<"number"> & {
    choices?: number[];
    default?: number;
    max?: number;
    min?: number;
    step?: number;
};

type NodeTextEntry = BaseNodeEntry<"text"> & {
    choices?: string[];
    default?: string;
    /** default 'true' */
    trim?: boolean;
    /** default 'text' */
    type?: NodeTextInputType;
};

type NodeBooleanEntry = BaseNodeEntry<"boolean"> & {
    default?: boolean;
};

type NodeTextInputType = (typeof NODE_INPUT_TEXT_TYPES)[number];

type BaseNodeEntry<TType extends NodeEntryType = NodeEntryType> = {
    key: string;
    type: TType;
    label?: string;
    group?: string;
    custom?: boolean;
};

type NodeOut = {
    key: string;
    label?: string;
};

export { TriggerNode };
