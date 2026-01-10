import { IconObject } from "_zod";
import { NodeEntry } from "engine";
import { LocalizeArgs, MODULE, z } from "module-helpers";
import { PreciseTextOptions } from "triggers-menu";

class NodeField<TValue extends unknown = unknown, TFieldSchema extends Record<string, any> = Record<string, any>>
    extends PIXI.Graphics
{
    //////////////////////////////
    // STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Defines the DataSchema for the input field that will be used in the triggers menu.
     */
    static get defineSchema(): NodeFieldSchema {
        throw MODULE.Error("'defineSchema' accessor not implemented.");
    }

    //////////////////////////////
    // IMMUTABLE ACCESSORS
    //////////////////////////////

    declare readonly entry: NodeEntry<TValue, TFieldSchema>;

    /**
     * @see {@link NodeField.defineSchema}
     *
     * The field data for this instance.
     */
    declare readonly field: TFieldSchema;

    /**
     * The already generated entry label element in case you want to manipulate it.
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
     * The current value of this input after going through {@link NodeEntry#isValidType}
     * & {@link NodeEntry#processValue}
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
     * @abstract
     * Draw the actual field.
     */
    draw(): void {
        throw MODULE.Error("'draw' method not implemented.");
    }

    /**
     * @abstract
     * Event listener called when the field is clicked on. It is only registered if the entry isn't connected.
     */
    onClick(): Promise<TValue> {
        throw MODULE.Error("'onClick' method not implemented.");
    }

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
        radius?: number | undefined,
    ) => void;

    /**
     * The bounds of the field in the viewport.
     */
    declare readonly getGlobalBounds: () => PIXI.Rectangle;

    /**
     * @see {@link TriggerNode#localize}
     */
    declare readonly localize: (...args: LocalizeArgs) => string | undefined;
}

type NodeFieldSchema = Record<string, z.core.JSONSchema.JSONSchema>;

export { NodeField };
export type { NodeFieldSchema };
