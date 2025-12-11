import { BaseEntrySchema } from "engine";
import { MODULE } from "module-helpers";
import fields = foundry.data.fields;
import { EntryCategory } from "triggers-menu";

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
     * Defines the DataSchema for the input field that will be used in the triggers menu.
     */
    static get fieldSchema(): fields.DataSchema | null {
        return null;
    }

    /**
     * The color of the node connection.
     */
    static get color(): ColorSource {
        return 0x000000;
    }

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    declare readonly fieldBackgroundColor: ColorSource;
    declare readonly fieldBorderColor: ColorSource;
    declare readonly fieldBorderWidth: number;
    declare readonly field: EntryField<TFieldSchema>;

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    //////////////////////////////
    // METHODS
    //////////////////////////////

    /**
     * This will only be called for input entries that have a {@link NodeEntry.fieldSchema}.
     *
     * @param label     the already generated label element for the entry in case you want to move
     *                  it inside the field instead of it being next to the connector.
     * @param maxHeight    the max height and entry row.
     * @returns         the field element to add to the input entry.
     */
    createFieldElement(label: PreciseText, maxHeight: number): PIXI.Graphics | null {
        return null;
    }
}

interface NodeEntry
    extends Pick<BaseEntrySchema, "key" | "label" | "group">,
        Pick<typeof NodeEntry, "type" | "color"> {
    readonly category: EntryCategory;
}

type EntryField<TFieldSchema extends fields.DataSchema | undefined = undefined> =
    TFieldSchema extends fields.DataSchema
        ? DeepPartial<ModelPropsFromSchema<TFieldSchema>>
        : undefined | null;

export { NodeEntry };
export type { EntryField };
