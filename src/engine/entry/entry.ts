import { BaseEntrySchema, NodeField } from "engine";
import { MODULE } from "module-helpers";
import fields = foundry.data.fields;

abstract class NodeEntry<
    TValue extends unknown = unknown,
    TFieldSchema extends fields.DataSchema | undefined = undefined
> {
    //////////////////////////////
    // ABSTRACT STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Must be an unique key among your registered module's entries (including the builtins)
     *
     * Localization path:
     * `<module-id>.<application-id>.node.<category>.<node-type>.entry.<type>`
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
    static get FieldClass(): typeof NodeField<unknown, fields.DataSchema> | null {
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
    declare readonly field: EntryField<TFieldSchema>;

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

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    /**
     * @returns true if the provided value is of type `TValue`
     */
    abstract isValidType(value: unknown): value is TValue;

    /**
     * Make the necessary modifications to the value to be used by the nodes.
     *
     * This is where you would use {@link NodeEntry#field} to customize the value.
     */
    abstract processValue(value: TValue): TValue;
}

interface NodeEntry
    extends Pick<BaseEntrySchema, "key" | "label" | "group">,
        Pick<typeof NodeEntry, "type" | "color"> {
    readonly isArray: boolean;
}

type EntryField<TFieldSchema extends fields.DataSchema | undefined = undefined> =
    TFieldSchema extends fields.DataSchema
        ? DeepPartial<ModelPropsFromSchema<TFieldSchema>>
        : undefined | null;

export { NodeEntry };
export type { EntryField };
