import { BaseEntrySchemaInput, NodeField } from "engine";
import { MODULE } from "module-helpers";

abstract class NodeEntry<
    TValue extends unknown = unknown,
    TFieldSchema extends Record<string, any> | undefined = undefined,
> {
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
        throw MODULE.Error("the 'type' static getter must be implemented.");
    }

    /**
     * @abstract
     * The default value for this input.
     */
    static get default(): unknown {
        throw MODULE.Error("the 'default' static getter must be implemented.");
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
     * The default value of this instance.
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
     * @returns true if the provided value is of type `TValue`
     */
    abstract isValidType(value: unknown): value is TValue;

    //////////////////////////////
    // METHODS
    //////////////////////////////

    /**
     * Make the necessary modifications to the value to be used by the nodes.
     */
    processValue(value: TValue): TValue {
        return value;
    }
}

interface NodeEntry
    extends
        Pick<BaseEntrySchemaInput, "isArray" | "key" | "label" | "group" | "tooltip">,
        Pick<typeof NodeEntry, "type" | "color"> {
    readonly isArray: boolean;
}

export { NodeEntry };
