import { BaseEntrySchemaOutput, ConnectionId, NodeField, TriggerNode } from "engine";
import { MODULE } from "module-helpers";

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
        throw MODULE.Error("Method not implemented.");
    }

    /**
     * @abstract
     * The default value for this input.
     */
    static get default(): unknown {
        throw MODULE.Error("Method not implemented.");
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

    /**
     * Tooltip to display when the entry is hovered over.
     */
    get generatedTooltip(): string | HTMLElement | undefined {
        return this.tooltip;
    }

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    /**
     * @abstract
     * @returns true if the provided value is of type `TValue` excluding `undefined`.
     */
    isValidType(value: unknown): value is Exclude<TValue, undefined> {
        throw MODULE.Error("Method not implemented.");
    }

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
     * Make the necessary modifications to the value to be used by the nodes.
     *
     * This is called at the end of the chain and is mostly there to use {@link NodeEntry#field}.
     */
    processValue(value: TValue): TValue {
        return value;
    }
}

interface NodeEntry<TValue extends unknown = unknown, TFieldSchema extends Record<string, any> | undefined = undefined>
    extends Omit<BaseEntrySchemaOutput, "hidden" | "state" | "type">, Pick<typeof NodeEntry, "type" | "color"> {
    get connection(): ConnectionId | undefined;
    get value(): TValue | undefined;
}

export { NodeEntry };
