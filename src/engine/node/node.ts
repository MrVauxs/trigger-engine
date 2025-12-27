import { IconObject } from "_zod";
import {
    BridgeSchema,
    CustomInputSchema,
    CustomOutputSchema,
    CustomOutSchema,
    InputEntrySchema,
    NodeField,
    OutputEntrySchema,
} from "engine";
import { LocalizeArgs, MODULE } from "module-helpers";
import { NodeData } from ".";

abstract class TriggerNode {
    //////////////////////////////
    // ABSTRACT STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Must be an unique key among your registered module's nodes (including builtins)
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
     * A node can have multiple layout states. Must at least contain 2 states if used.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.states.<state>`
     */
    static get states(): string[] | null {
        return null;
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
     * Some nodes may not want to only have value inputs.
     * This can only be used in conjunction with entries with a field.
     */
    static get inputsHaveConnector(): boolean {
        return true;
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
     * `<module-id>.<application-id>.node.<category>.<type>.outs.<key>`
     */
    static get defineOuts(): string | BridgeSchema[] | null {
        return "out";
    }

    /**
     * Define the inputs for this node if any. Inputs can make use of {@link NodeField.defineSchema}.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.inputs.<key>`
     */
    static get defineInputs(): InputEntrySchema[] | null {
        return null;
    }

    /**
     * Define the outputs for this node if any.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.outputs.<key>`
     */
    static get defineOutputs(): OutputEntrySchema[] | null {
        return null;
    }

    // TODO
    /**
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.custom.outs.<slug>.label`
     * `<module-id>.<application-id>.node.<category>.<type>.custom.outs.<slug>.placeholder`
     * `<module-id>.<application-id>.node.<category>.<type>.custom.outs.<slug>.input.label`
     * `<module-id>.<application-id>.node.<category>.<type>.custom.outs.<slug>.input.placeholder`
     */
    static get defineCustomOuts(): CustomOutSchema[] | null {
        return null;
    }

    // TODO
    static get defineCustomInputs(): CustomInputSchema[] | null {
        return null;
    }

    // TODO
    static get defineCustomOutputs(): CustomOutputSchema[] | null {
        return null;
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
     * The appearing title on the node.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.title`
     */
    get title(): string | null {
        return this.localize("title") ?? null;
    }

    /**
     * The appearing subtitle on the node. Is only used if the node has a 'title'.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.subtitle`
     */
    get subtitle(): string | null {
        return this.localize("subtitle") ?? null;
    }

    /**
     * The appearing icon on the node. Is only used if the node has a 'title'.
     */
    get icon(): string | IconObject | null {
        return null;
    }

    /**
     * The background color for the header. Is only used if the node has a 'title'.
     */
    get headerColor(): `#${string}` | number | null {
        return this.isEvent ? "#C40000" : "#0c0c0c";
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
    abstract execute(options?: Record<string, any>): Promise<boolean>;

    /**
     * @abstract
     * A node without 'in' nor 'outs' is considered a `query` node.
     *
     * @param key is the key of the output entry that was requested by the other node.
     *
     * @returns the computed value of the output type requested by the other node.
     * If the returned value isn't compatible with the connection type, the default value will be instead be returned.
     */
    abstract query(key: string): Promise<any>;
}

interface TriggerNode
    extends Pick<NodeData, "id" | "invalid">,
        Pick<typeof TriggerNode, "category" | "isEvent" | "type"> {}

export { TriggerNode };
