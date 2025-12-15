import { NodeField } from "engine";
import fields = foundry.data.fields;

abstract class BuiltInEntryField<
    TValue extends unknown,
    TFieldSchema extends fields.DataSchema
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
