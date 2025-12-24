import { NodeField } from "engine";

abstract class BuiltInEntryField<
    TValue extends unknown,
    TFieldSchema extends Record<string, any>
> extends NodeField<TValue, TFieldSchema> {
    get backgroundColor(): ColorSource {
        return 0x3b3b3b;
    }

    get borderColor(): ColorSource {
        return 0xffffff;
    }

    get borderWidth(): number {
        return 1;
    }
}

export { BuiltInEntryField };
