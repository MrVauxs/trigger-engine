import { BaseEntrySchema, NodeEntryData, NodeEntrySchema, TriggerNode } from "engine";
import { MODULE, R } from "module-helpers";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeEntry<
    TValue extends unknown = unknown,
    TFieldSchema extends fields.DataSchema | undefined = undefined
> {
    #data: NodeEntryData | undefined;
    #parent: TriggerNode;
    // #schema: NodeEntrySchema;

    constructor(parent: TriggerNode, schema: BaseEntrySchema, data: NodeEntryData | undefined) {
        MODULE.assert(
            parent instanceof TriggerNode && !parent.invalid,
            "parent argument must be a valid 'TriggerNode'."
        );

        MODULE.assert(
            data instanceof NodeEntryData && !data.invalid,
            "schema argument must be a valid 'NodeData'."
        );

        this.#data = data;
        this.#parent = parent;
        // this.#schema = schema;

        const entryFieldSchema = (this.constructor as typeof NodeEntry).fieldSchema;

        class EntryField extends abstract.DataModel {
            static defineSchema() {
                return entryFieldSchema ?? {};
            }
        }

        const fieldData = "fields" in schema && R.isPlainObject(schema.fields) && schema.fields;
        const entrySchema = new NodeEntrySchema(schema);
        // TODO we need to actually pass the data here
        const entryField = entryFieldSchema && fieldData ? new EntryField(fieldData as any) : null;

        // Object.defineProperty(this, "field", {
        //     value: field,
        //     configurable: false,
        //     enumerable: false,
        //     writable: false,
        // });

        // Object.freeze(this.field);

        // from schema accessors
        Object.defineProperties(
            this,
            R.fromKeys(["key", "label", "group"] as const, (property) => {
                return {
                    value: entrySchema[property],
                    configurable: false,
                    enumerable: true,
                    writable: false,
                };
            })
        );

        // from static accessors
        Object.defineProperties(
            this,
            R.fromKeys(["type", "color"] as const, (property) => {
                return {
                    value: (this.constructor as typeof NodeEntry)[property],
                    configurable: false,
                    enumerable: true,
                    writable: false,
                };
            })
        );
    }

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
     * @abstract
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

    declare readonly field: EntryField<TFieldSchema>;

    //////////////////////////////
    // PRIVATE METHODS
    //////////////////////////////
}

interface NodeEntry
    extends Pick<BaseEntrySchema, "key" | "label" | "group">,
        Pick<typeof NodeEntry, "type" | "color"> {}

type EntryField<TFieldSchema extends fields.DataSchema | undefined = undefined> =
    TFieldSchema extends fields.DataSchema
        ? DeepPartial<ModelPropsFromSchema<TFieldSchema>>
        : undefined | null;

export { NodeEntry };
export type { EntryField };
