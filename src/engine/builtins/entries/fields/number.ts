import { InputField } from ".";
import fields = foundry.data.fields;

class NumberField extends InputField<number, NumberFieldSchema> {
    static get defineSchema(): NumberFieldSchema {
        return {
            choices: new fields.ArrayField(
                new fields.NumberField({
                    required: true,
                    nullable: false,
                }),
                {
                    required: false,
                    nullable: false,
                    initial: () => [],
                }
            ),
            default: new fields.NumberField({
                required: false,
                nullable: false,
                initial: undefined,
            }),
            max: new fields.NumberField({
                required: false,
                nullable: false,
                initial: undefined,
            }),
            min: new fields.NumberField({
                required: false,
                nullable: false,
                initial: undefined,
            }),
            step: new fields.NumberField({
                required: false,
                nullable: false,
                initial: 1,
            }),
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
    choices: fields.ArrayField<fields.NumberField<number, number, true, false, false>>;
    default: fields.NumberField<number, number, false, false, false>;
    max: fields.NumberField<number, number, false, false, false>;
    min: fields.NumberField<number, number, false, false, false>;
    step: fields.NumberField<number, number, false, false, true>;
};

export { NumberField };
export type { NumberFieldSchema };
