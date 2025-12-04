import { NodeEntry } from "engine";
import fields = foundry.data.fields;

class BuiltInNodeEntry<
    TInputSchema extends fields.DataSchema | undefined
> extends NodeEntry<TInputSchema> {}

function isBuiltInEntry(node: typeof NodeEntry): node is typeof BuiltInNodeEntry {
    return node.prototype instanceof BuiltInNodeEntry;
}

export { BuiltInNodeEntry, isBuiltInEntry };
