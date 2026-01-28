import { BaseEntrySchemaOutput, ConnectionId, EntryCategory, NodeField, TriggerNode } from "engine";
import { LocalizeArgs, MODULE, R } from "module-helpers";

// IMPORTANT an entry can never represent an array
class NodeEntry<TValue extends unknown = unknown, TFieldSchema extends Record<string, any> | undefined = undefined> {
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

    /** Class inheriting `NodeField` to represent the input field of this entry. */
    static get FieldClass(): typeof NodeField<unknown, Record<string, any>> | null {
        return null;
    }

    /** The color of the node connection. */
    static get color(): ColorSource {
        return 0x000000;
    }

    /**
     * Cast the value from a different type.
     *
     * This is not equivalent to `EntryConvertor`, it doesn't necessarily expect `TValue`, but when setting an output
     * value using {@link TriggerNode#setOutputValue}, it allows to provide a different type that will be cast here.
     */
    static castValue(value: unknown): unknown {
        return value;
    }

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

    /**
     * @see {@link NodeEntry.default}
     *
     * The default value of this instance. Should be modified by {@link NodeEntry#field}.
     */
    get default(): TValue {
        return (this.constructor as typeof NodeEntry).default as TValue;
    }

    /**
     * Tooltip to display when the entry is hovered over.
     */
    generateTooltip(label: string, isConnected: boolean): string | undefined {
        if (this.tooltip === false) return;

        if (R.isString(this.tooltip)) {
            return game.i18n.localize(this.tooltip);
        }

        const customTooltip = this.slug && this.localize("customs", this.category, this.slug, "tooltip");

        return (
            customTooltip ??
            this.localize(this.category, this.key, "tooltip") ??
            this.rootLocalize("entry", this.key, "tooltip")
        );
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

interface NodeEntry<
    TValue extends unknown = unknown,
    TFieldSchema extends Record<string, any> | undefined = undefined,
> extends Pick<BaseEntrySchemaOutput, "input" | "isArray" | "key" | "label" | "slug" | "tooltip"> {
    /** The entry category. */
    get category(): EntryCategory;
    /** @see {@link NodeEntry.color} */
    get color(): ColorSource;
    /** The connection path of this entry. */
    get connection(): ConnectionId | undefined;
    /** @see {@link NodeField.defineSchema} The field data for this instance. */
    get field(): TFieldSchema;
    /** The local value of this entry. */
    get value(): TValue | undefined;
    /** @see {@link NodeEntry.type} */
    get type(): string;

    /** @see {@link NodeEntry.castValue} */
    castValue(value: unknown): unknown;

    /** @see {@link NodeEntry.fromJSON} */
    fromJSON(value: JSONValue): Promise<any> | any;

    /** @see {@link NodeEntry.isValidType} */
    isValidType(value: unknown): value is Exclude<TValue, undefined>;

    /** @see {@link TriggerNode#localize} */
    localize(...args: LocalizeArgs): string | undefined;

    /** @see {@link TriggerNode#rootLocalize} */
    rootLocalize(...args: LocalizeArgs): string | undefined;

    /** @see {@link NodeEntry.toJSON} */
    toJSON(value: TValue): JSONValue;
}

export { NodeEntry };
