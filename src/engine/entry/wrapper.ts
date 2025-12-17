import {
    InputEntrySchema,
    NodeData,
    NodeDataSource,
    NodeEntry,
    NodeEntrySchema,
    NodeField,
    Trigger,
    TriggerNode,
} from "engine";
import { R } from "module-helpers";
import { EntryCategory } from "triggers-menu";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    schema: InputEntrySchema,
    data: NodeData,
    open: true
): OpenNodeEntry | undefined;
function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    schema: InputEntrySchema,
    data: NodeData,
    open: boolean
): NodeEntry | undefined;
function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    schema: InputEntrySchema,
    data: NodeData,
    open: boolean
): NodeEntry | OpenNodeEntry | undefined {
    const EntryCls = trigger.application.entries.get(schema.type) as typeof NodeEntry;
    if (!EntryCls) return;

    const fieldData = "field" in schema && R.isPlainObject(schema.field) && schema.field;
    const entrySchema = new NodeEntrySchema(R.omit(schema, ["field"]));

    class NodeEntryWrapper extends EntryCls {
        constructor() {
            super();

            if (category === "inputs" && !entrySchema.isArray) {
                let entryField: abstract.DataModel | {} = {};

                try {
                    const FieldCls = EntryCls.FieldClass;

                    if (FieldCls && !(FieldCls.prototype instanceof NodeField)) {
                        throw new Error("invalid 'FieldCls' type.");
                    }

                    if (parent.isEvent && !FieldCls) {
                        throw new Error("event nodes can only have inputs with a field.");
                    }

                    const fieldSchema = EntryCls.FieldClass?.defineSchema;

                    class EntryField extends abstract.DataModel {
                        static defineSchema(): fields.DataSchema {
                            return fieldSchema ?? {};
                        }
                    }

                    const field = new EntryField((fieldSchema && (fieldData as any)) || {});

                    if (!field.invalid) {
                        entryField = field;
                    }
                } catch (error) {
                } finally {
                    Object.defineProperty(this, "field", {
                        value: entryField,
                        configurable: false,
                        enumerable: false,
                        writable: false,
                    });

                    foundry.utils.deepFreeze(this.field);
                }
            }

            // from schema accessors
            Object.defineProperties(
                this,
                R.fromKeys(["isArray", "key", "label", "group"] as const, (property) => {
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
                        value: EntryCls[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                })
            );

            if (open) {
                Object.defineProperties(this, {
                    category: {
                        value: category,
                    },
                    data: {
                        get() {
                            return (category === "inputs" && data.inputs[entrySchema.key]) || {};
                        },
                    },
                });
            }
        }
    }

    interface NodeEntryWrapper {
        isValidType(value: unknown): value is unknown;
    }

    return new NodeEntryWrapper();
}

interface OpenNodeEntry extends NodeEntry {
    category: EntryCategory;
    get data(): ValueOf<NodeDataSource["inputs"]>;
}

export { instantiateEntry };
export type { OpenNodeEntry };
