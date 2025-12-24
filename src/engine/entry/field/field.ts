import { IconObject } from "_zod";
import { NodeEntry } from "engine";
import { MODULE, z } from "module-helpers";
import { PreciseTextOptions } from "triggers-menu";

abstract class NodeField<
    TValue extends unknown = unknown,
    TFieldSchema extends Record<string, any> = Record<string, any>
> extends PIXI.Graphics {
    //////////////////////////////
    // STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     *
     * Defines the DataSchema for the input field that will be used in the triggers menu.
     */
    static get defineSchema(): z.core.JSONSchema.ObjectSchema {
        throw MODULE.Error("the 'defineSchema' static getter must be implemented.");
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

    /**
     * The already generated entry label in case you want to add it to the field instead of
     * having it next to the connector on its own.
     */
    declare readonly label: PreciseText;

    /**
     * Is this entry currently connected to another node.
     */
    declare readonly isConnected: boolean;

    /**
     * The max height of an entry row.
     *
     * You should make sure everything fits in it to avoid overlapping between rows.
     */
    declare readonly maxHeight: number;

    /**
     * The base font size of nodes in 'px'.
     */
    declare readonly baseFontSize: number;

    /**
     * @see {@link NodeEntry.default}
     *
     * The default value of this input.
     */
    declare readonly default: TValue;

    /**
     * The current value of this input after going through {@link NodeEntry#isValidType} & {@link NodeEntry#processValue}
     */
    declare readonly value: TValue;

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    get cursor(): PIXI.Cursor {
        return "default";
    }

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    /**
     * Draw the actual field.
     */
    abstract draw(): void;

    /**
     * Event listener called when the field is clicked on. It is only registerred if the entry isn't connected.
     */
    abstract onClick(): Promise<TValue>;

    //////////////////////////////
    // IMMUTABLE METHODS
    //////////////////////////////

    /**
     * Creates a font-awesome icon in a canvas compatible form.
     */
    declare readonly createFontAwesomeIcon: (icon: IconObject) => PreciseText;

    /**
     * Creates a text element in a canvas compatible form.
     */
    declare readonly createPreciseText: (text: string, options?: PreciseTextOptions) => PreciseText;

    /**
     * Creates a PIXI mask and applies it directly onto `parent`.
     */
    declare readonly addRectangleMask: (
        parent: PIXI.Container,
        x: number,
        y: number,
        width: number,
        height: number,
        radius?: number | undefined
    ) => void;

    /**
     * The bounds of the field in the viewport.
     */
    declare readonly getGlobalBounds: () => PIXI.Rectangle;
}

export { NodeField };
