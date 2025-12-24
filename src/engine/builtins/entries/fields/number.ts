import { z } from "module-helpers";
import { InputField } from ".";

class NumberField extends InputField<number, NumberFieldSchema> {
    static get defineSchema(): z.core.JSONSchema.ObjectSchema {
        return {
            type: "object",
            properties: {
                default: { type: "number" },
                min: { type: "number" },
                max: { type: "number" },
                step: { default: 1, type: "number" },
            },
        };
    }

    get fontSize(): number {
        return this.baseFontSize * 0.9;
    }

    get width(): number {
        return 40;
    }

    get targetWidth(): number {
        return 80;
    }

    get toDisplay(): string {
        return String(this.value);
    }

    createInput(): HTMLInputElement {
        const { min, max, step } = this.field;

        return foundry.applications.fields.createNumberInput({
            name: "field",
            placeholder: String(this.default),
            value: this.value,
            min,
            max,
            step,
        });
    }

    afterRender(input: HTMLInputElement): void {
        input.focus();
    }

    afterAnimation(input: HTMLInputElement): void {
        input.select();
    }
}

type NumberFieldSchema = {
    default?: number;
    max?: number;
    min?: number;
    step: number;
};

export { NumberField };
export type { NumberFieldSchema };
