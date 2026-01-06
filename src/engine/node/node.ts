import { IconObject } from "_zod";
import {
    BridgeSchemaInput,
    CustomInputSchema,
    CustomOutputSchema,
    CustomOutSchema,
    InputEntrySchemaSource,
    NodeField,
    OutputEntrySchemaSource,
    TriggerPath,
} from "engine";
import { LocalizeArgs, MODULE } from "module-helpers";
import { NodeData } from ".";

class TriggerNode<
    TOuts extends string | never = string,
    TInputs extends Record<string, any> | never = Record<string, any>,
    TOutputs extends Record<string, any> | never = Record<string, any>,
    TCustomInputs extends string | never = string,
    TCustomOutputs extends string | never = string,
> {
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
        throw MODULE.Error("Method not implemented.");
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
     * Some nodes may want to only have value inputs.
     * This can only be used in conjunction with entries with a field.
     */
    static get inputsHaveConnector(): boolean {
        return true;
    }

    /**
     * Does this node have an `in` bridge entry.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.in`
     */
    static get hasIn(): boolean {
        return true;
    }

    /**
     * List of `out` bridge entries.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.outs.<key>`
     */
    static get defineOuts(): BridgeSchemaInput[] | null {
        return [{ key: "out" }];
    }

    /**
     * Define the inputs for this node if any. Inputs can make use of {@link NodeField.defineSchema}.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.inputs.<key>`
     * `<module-id>.<application-id>.node.<category>.<type>.group.<group>`
     */
    static get defineInputs(): InputEntrySchemaSource[] | null {
        return null;
    }

    /**
     * Define the outputs for this node if any.
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<type>.outputs.<key>`
     */
    static get defineOutputs(): OutputEntrySchemaSource[] | null {
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

    //////////////////////////////
    // IMMUTABLE ACCESSORS
    //////////////////////////////

    /**
     * The internal path for the parent trigger.
     */
    declare readonly triggerPath: TriggerPath;

    /**
     * The internal path for the node.
     */
    declare readonly nodePath: TriggerNodePath;

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
        return this.localize("subtitle") ?? this.rootLocalize("category.action.title") ?? null;
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
     * Calls the next `executable` node in the chain.
     *
     * @param out key of the selected `out` bridge
     *
     * @example
     * return this.executeNext("out")
     *
     * @example
     * return this.executeNext("true")
     *
     * @see {@link TriggerNode#_execute}
     */
    declare readonly executeNext: (out: TOuts) => Promise<boolean>;

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
     * @see {@link TriggerNode#_execute}
     */
    declare readonly getInputValue: <K extends keyof TInputs>(input: K) => Promise<TInputs[K]>;

    // TODO
    declare readonly getCustomInputsValues: (slug: TCustomInputs) => Promise<{ label: string; value: any }[]>;

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
     * @see {@link TriggerNode.defineOutputs}
     */
    declare readonly setOutputValue: <K extends keyof TOuts>(output: K, value: TOuts[K]) => void;

    /**
     * Set values for this node's custom outputs.
     *
     * @param slug of the custom outputs
     * @param values array where each entry represents a one of the custom entry (same index order as seen in the node).
     *
     * @see {@link TriggerNode.defineCustomOutputs}
     */
    declare readonly setCustomOutputValues: (slug: TCustomOutputs, values: any[]) => void;

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    /**
     * @abstract
     * A node with `in` or `outs` is considered an `executable` node.
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
    _execute(options?: Record<string, any>): Promise<boolean> {
        throw MODULE.Error("Method not implemented.");
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
    _query(key: string): Promise<any> {
        throw MODULE.Error("Method not implemented.");
    }
}

interface TriggerNode
    extends Pick<NodeData, "id" | "invalid">, Pick<typeof TriggerNode, "category" | "isEvent" | "type"> {}

type TriggerNodePath = `${TriggerPath}:${string}`;

export { TriggerNode };
export type { TriggerNodePath };
