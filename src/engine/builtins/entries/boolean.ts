import { BooleanField, BooleanFieldSchema, BuiltInNodeEntry } from ".";

class BooleanEntry extends BuiltInNodeEntry<boolean, BooleanFieldSchema> {
    static get type(): "boolean" {
        return "boolean";
    }

    static get default(): boolean {
        return false;
    }

    static get color(): ColorSource {
        return 0xad0303;
    }

    static get FieldClass(): typeof BooleanField {
        return BooleanField;
    }

    get default(): boolean {
        return this.field.default ?? super.default;
    }

    castValue(value: unknown): boolean {
        return !!value;
    }

    processValue(value: boolean): boolean {
        return value;
    }
}

export { BooleanEntry };
