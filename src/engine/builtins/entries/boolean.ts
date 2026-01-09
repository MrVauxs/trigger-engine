import { R } from "module-helpers";
import { BaseInputEntrySchema, BooleanField, BooleanFieldSchema, BuiltInNodeEntry } from ".";

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

    static isValidType(value: unknown): value is boolean {
        return R.isBoolean(value);
    }

    static toJSON(value: boolean): boolean {
        return value;
    }

    static fromJSON(value: JSONValue): boolean {
        return Boolean(value);
    }

    get default(): boolean {
        return this.field.default ?? super.default;
    }
}

type InputBooleanEntry = BaseInputEntrySchema<"boolean", BooleanFieldSchema>;

export { BooleanEntry };
export type { InputBooleanEntry };
