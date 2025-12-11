import { InputEntrySchema, NodeEntry, NodeEntrySchema, Trigger, TriggerNode } from "engine";
import { R } from "module-helpers";
import { EntryCategory } from "triggers-menu";
import abstract = foundry.abstract;

function instantiateEntry(
    trigger: Trigger,
    parent: TriggerNode,
    category: EntryCategory,
    schema: InputEntrySchema
): NodeEntry | undefined {
    const EntryCls = trigger.application.entries.get(schema.type) as typeof NodeEntry;
    if (!EntryCls) return;

    class EntryNodeWrapper extends EntryCls {
        constructor() {
            super();

            const fieldData = "field" in schema && R.isPlainObject(schema.field) && schema.field;
            const entrySchema = new NodeEntrySchema(R.omit(schema, ["field"]));

            if (category === "inputs") {
                let entryField: abstract.DataModel | {} = {};

                try {
                    const fieldSchema = EntryCls.fieldSchema;

                    class EntryField extends abstract.DataModel {
                        static defineSchema() {
                            return fieldSchema ?? {};
                        }
                    }

                    const field = new EntryField((fieldSchema && (fieldData as any)) || {});

                    if (field && !field.invalid) {
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
                        value: EntryCls[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                })
            );

            // static accessors
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["category", category],
                        ["fieldBackgroundColor", 0x3b3b3b],
                        ["fieldBorderColor", 0xffffff],
                        ["fieldBorderWidth", 1],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((value) => {
                        return {
                            value,
                            configurable: false,
                            enumerable: true,
                            writable: false,
                        };
                    })
                )
            );
        }
    }

    return new EntryNodeWrapper();
}

export { instantiateEntry };
