import { NodeEntry } from "engine";
import fields = foundry.data.fields;

abstract class BuiltInNodeEntry<
    TValue extends unknown,
    TFieldSchema extends fields.DataSchema | undefined
> extends NodeEntry<TValue, TFieldSchema> {}

function isBuiltInEntry(entry: typeof NodeEntry): entry is typeof BuiltInNodeEntry {
    return entry.prototype instanceof BuiltInNodeEntry;
}

export { BuiltInNodeEntry, isBuiltInEntry };
