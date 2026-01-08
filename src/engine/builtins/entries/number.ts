import { R, roundToStep } from "module-helpers";
import { BuiltInNodeEntry, NumberField, NumberFieldSchema } from ".";

class NumberEntry extends BuiltInNodeEntry<number, NumberFieldSchema> {
    static get type(): "number" {
        return "number";
    }

    static get default(): number {
        return 0;
    }

    static get color(): ColorSource {
        return 0x07b88f;
    }

    static get FieldClass(): typeof NumberField {
        return NumberField;
    }

    static isValidType(value: unknown): value is number {
        return R.isNumber(value);
    }

    static toJSON(value: number): number {
        return value;
    }

    static fromJSON(value: JSONValue): number {
        return Number(value);
    }

    get default(): number {
        return this.field.default ?? super.default;
    }

    castValue(value: unknown): number {
        return Number(value) || 0;
    }

    processValue(value: number): number {
        const { min = -Infinity, max = Infinity, step } = this.field;
        const stepped = R.isNumber(step) ? roundToStep(value, step) : value;
        const clamped = Math.clamp(stepped, min, max);

        return R.isIncludedIn(clamped, [Infinity, -Infinity]) ? 0 : clamped;
    }
}

export { NumberEntry };
