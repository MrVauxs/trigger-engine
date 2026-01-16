import {
    BaseEntrySchemaInput,
    BaseEntrySchemaOutput,
    NodeData,
    NodeEntry,
    NodeField,
    OpenTrigger,
    OpenTriggerNode,
    Trigger,
    TriggerNode,
} from "engine";
import { LocalizeArgs, R, z, zForceSafeParse } from "module-helpers";
import { EntryCategory } from "triggers-menu";

function instantiateEntry(
    trigger: OpenTrigger,
    parent: OpenTriggerNode,
    category: EntryCategory,
    entrySchema: BaseEntrySchemaInput,
    nodeData: NodeData,
    open: true,
): OpenNodeEntry | undefined;
function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    entrySchema: BaseEntrySchemaInput,
    nodeData: NodeData,
    open: boolean,
): NodeEntry | undefined;
function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    entrySchema: BaseEntrySchemaInput,
    nodeData: NodeData,
    open: boolean,
): NodeEntry | OpenNodeEntry | undefined {
    const EntryCls = trigger.application.entries.get(entrySchema.type) as typeof NodeEntry;
    if (!EntryCls) return;

    let entryField: Record<string, any> = {};

    if (category === "inputs" && !entrySchema.isArray) {
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
                const fieldSchema = z.fromJSONSchema({
                    type: "object",
                    properties: jsonSchema,
                });
                const data = "field" in entrySchema && R.isPlainObject(entrySchema.field) ? entrySchema.field : {};

                entryField = zForceSafeParse(fieldSchema, data) as any;
            }
        } catch (error) {}
    }

    function localize(...args: LocalizeArgs): string | undefined {
        return parent.localize(...args);
    }

    class NodeEntryWrapper extends EntryCls {
        constructor() {
            super();

            // field
            Object.defineProperty(this, "field", {
                value: entryField,
                configurable: false,
                enumerable: false,
                writable: false,
            });

            foundry.utils.deepFreeze(this.field);

            Object.defineProperty(this, "category", {
                value: category,
                configurable: false,
                enumerable: true,
                writable: false,
            });

            // from data
            Object.defineProperties(
                this,
                R.fromKeys(["connection", "value"] as const, (property) => {
                    return {
                        get() {
                            return category === "inputs" ? nodeData.inputs[entrySchema.key]?.[property] : undefined;
                        },
                        configurable: false,
                        enumerable: true,
                    };
                }),
            );

            // from schema accessors
            Object.defineProperties(
                this,
                R.fromKeys(["isArray", "key", "label", "group", "slug", "spacing"] as const, (property) => {
                    return {
                        value: entrySchema[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                }),
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
                }),
            );

            // from static methods
            Object.defineProperties(
                this,
                R.fromKeys(["fromJSON", "isValidType", "toJSON"] as const, (property) => {
                    return {
                        value: EntryCls[property],
                        configurable: false,
                        enumerable: false,
                        writable: false,
                    };
                }),
            );

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [["localize", localize]] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    }),
                ),
            );

            if (open) {
                Object.defineProperties(this, {
                    schema: {
                        get() {
                            return entrySchema;
                        },
                    },
                });
            }
        }
    }

    return new NodeEntryWrapper();
}

interface OpenNodeEntry extends NodeEntry {
    get schema(): BaseEntrySchemaOutput;
}

export { instantiateEntry };
export type { OpenNodeEntry };
