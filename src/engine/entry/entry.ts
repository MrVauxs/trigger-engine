import { BaseEntrySchemaOutput, ConnectionId, EntryCategory, NodeField, TriggerNode } from "engine";
import { LocalizeArgs, MODULE } from "module-helpers";

// IMPORTANT an entry can never represent an array
class NodeEntry<TValue extends unknown = unknown, TFieldSchema extends Record<string, any> | undefined = undefined> {
    //////////////////////////////
    // ABSTRACT STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Must be an unique key among your registered module's entries (including the builtins)
     *
     * Localization path:
     * `<module-id>.<application-id>.entry.<type>.title`
     */
    static get type(): string {
        throw MODULE.Error("'type' accessor not implemented.");
    }

    /**
     * @abstract
     * The default value for this input.
     */
    static get default(): unknown {
        throw MODULE.Error("'default' accessor not implemented.");
    }

    //////////////////////////////
    // STATIC ACCESSORS
    //////////////////////////////

    /**
     * Class inheriting `NodeField` to represent the input field of this entry.
     */
    static get FieldClass(): typeof NodeField<unknown, Record<string, any>> | null {
        return null;
    }

    /**
     * The color of the node connection.
     */
    static get color(): ColorSource {
        return 0x000000;
    }

    //////////////////////////////
    // STATIC ABSTRACT METHODS
    //////////////////////////////

    /**
     * @abstract
     * @returns true if the provided value is of type `TValue` excluding `undefined`.
     */
    static isValidType(value: unknown): boolean {
        throw MODULE.Error("'isValidType' method not implemented.");
    }

    /**
     * @abstract
     * Convert the value into something that stringifiable.
     */
    static toJSON(value: any): JSONValue {
        throw MODULE.Error("'isValidType' method not implemented.");
    }

    /**
     * @abstract
     * Convert the value back from its stringifiable version.
     */
    static fromJSON(value: JSONValue): Promise<any> | any {
        throw MODULE.Error("'isValidType' method not implemented.");
    }

    //////////////////////////////
    // IMMUTABLE ACCESSORS
    //////////////////////////////

    /**
     * @see {@link NodeField.defineSchema}
     *
     * The field data for this instance.
     */
    declare readonly field: TFieldSchema;

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    /**
     * @see {@link NodeEntry.default}
     *
     * The default value of this instance. Should be modified by {@link NodeEntry#field}.
     */
    get default(): TValue {
        return (this.constructor as typeof NodeEntry).default as TValue;
    }

    //////////////////////////////
    // IMMUTABLE METHODS
    //////////////////////////////

    /**
     * @see {@link NodeEntry.fromJSON}
     */
    declare readonly fromJSON: (value: JSONValue) => Promise<any> | any;

    /**
     * @see {@link NodeEntry.isValidType}
     */
    declare readonly isValidType: (value: unknown) => value is Exclude<TValue, undefined>;

    /**
     * @see {@link TriggerNode#localize}
     */
    declare readonly localize: (...args: LocalizeArgs) => string | undefined;

    /**
     * @see {@link NodeEntry.toJSON}
     */
    declare readonly toJSON: (value: any) => JSONValue;

    //////////////////////////////
    // METHODS
    //////////////////////////////

    /**
     * Cast the value from a different type.
     *
     * This is not equivalent to `EntryConvertor`, it doesn't necessarily expect `TValue`, but when setting an output
     * value using {@link TriggerNode#setOutputValue}, it allows to provide a different type that will be cast here.
     */
    castValue(value: unknown): unknown {
        return value;
    }

    /**
     * Tooltip to display when the entry is hovered over.
     */
    generateTooltip(label: string, isConnected: boolean): string | undefined {
        return this.slug
            ? this.localize("customs", this.category, this.slug, "tooltip")
            : this.localize(this.category, this.key, "tooltip");
    }

    /**
     * Make the necessary modifications to the value to be used by the nodes.
     *
     * This is called at the end of the chain and is mostly there to use {@link NodeEntry#field}.
     */
    processValue(value: TValue): TValue {
        return value;
    }
}

interface NodeEntry<TValue extends unknown = unknown, TFieldSchema extends Record<string, any> | undefined = undefined>
    extends Omit<BaseEntrySchemaOutput, "state" | "type">, Pick<typeof NodeEntry, "type" | "color"> {
    readonly category: EntryCategory;
    get connection(): ConnectionId | undefined;
    get value(): TValue | undefined;
}

export { NodeEntry };
