import { NodeEntry } from "engine";
import fields = foundry.data.fields;

class BuiltInNodeEntry<
    TValue extends unknown,
    TFieldSchema extends fields.DataSchema | undefined
> extends NodeEntry<TValue, TFieldSchema> {}

function isBuiltInEntry(node: typeof NodeEntry): node is typeof BuiltInNodeEntry {
    return node.prototype instanceof BuiltInNodeEntry;
}

export { BuiltInNodeEntry, isBuiltInEntry };
