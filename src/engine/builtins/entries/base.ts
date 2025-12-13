import { NodeEntry } from "engine";
import fields = foundry.data.fields;

abstract class BuiltInNodeEntry<
    TValue extends unknown,
    TFieldSchema extends fields.DataSchema | undefined
> extends NodeEntry<TValue, TFieldSchema> {
    get fieldBorderColor(): ColorSource {
        return 0xffffff;
    }

    get fieldBackgroundColor(): ColorSource {
        return 0x3b3b3b;
    }

    get fieldBorderWidth(): number {
        return 1;
    }
}

function isBuiltInEntry(entry: typeof NodeEntry): entry is typeof BuiltInNodeEntry {
    return entry.prototype instanceof BuiltInNodeEntry;
}

export { BuiltInNodeEntry, isBuiltInEntry };
