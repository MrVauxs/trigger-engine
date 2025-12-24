import {
    BaseEntrySchema,
    InputEntrySchema,
    NodeData,
    NodeDataOutput,
    NodeEntry,
    NodeField,
    OpenTrigger,
    OpenTriggerNode,
    Trigger,
    TriggerNode,
    zNodeEntrySchema,
} from "engine";
import { R, z, zForceSafeParse } from "module-helpers";
import { EntryCategory } from "triggers-menu";

function instantiateEntry(
    trigger: OpenTrigger,
    parent: OpenTriggerNode,
    category: EntryCategory,
    schema: BaseEntrySchema,
    nodeData: NodeData,
    open: true
): OpenNodeEntry | undefined;
function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    schema: BaseEntrySchema,
    nodeData: NodeData,
    open: boolean
): NodeEntry | undefined;
function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    schema: BaseEntrySchema,
    nodeData: NodeData,
    open: boolean
): NodeEntry | OpenNodeEntry | undefined {
    const EntryCls = trigger.application.entries.get(schema.type) as typeof NodeEntry;
    if (!EntryCls) return;

    const fieldData = "field" in schema && R.isPlainObject(schema.field) && schema.field;
    const entrySchema = zNodeEntrySchema().parse(R.omit(schema as InputEntrySchema, ["field"]));

    class NodeEntryWrapper extends EntryCls {
        constructor() {
            super();

            if (category === "inputs" && !entrySchema.isArray) {
                let entryField: Record<string, any> = {};

                try {
                    const FieldCls = EntryCls.FieldClass;

                    if (FieldCls && !(FieldCls.prototype instanceof NodeField)) {
                        throw new Error("invalid 'FieldCls' type.");
                    }

                    if (parent.isEvent && !FieldCls) {
                        throw new Error("event nodes can only have inputs with a field.");
                    }

                    const jsonSchema = EntryCls.FieldClass?.defineSchema;
                    if (jsonSchema) {
                        const fieldSchema = z.fromJSONSchema(jsonSchema);
                        const data = R.isObjectType(fieldData) ? fieldData : {};

                        entryField = zForceSafeParse(fieldSchema, data) as any;
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
                            return (
                                (category === "inputs" && nodeData.inputs[entrySchema.key]) || {}
                            );
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
    get data(): ValueOf<NodeDataOutput["inputs"]>;
}

export { instantiateEntry };
export type { OpenNodeEntry };
