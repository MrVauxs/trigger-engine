import { NodeEntry } from "engine";

abstract class BuiltInNodeEntry<
    TValue extends unknown,
    TFieldSchema extends Record<string, any> | undefined = undefined,
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

export { BuiltInNodeEntry };
