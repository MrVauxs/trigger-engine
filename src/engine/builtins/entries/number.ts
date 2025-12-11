import { BuiltInNodeEntry } from ".";
import fields = foundry.data.fields;

class NumberNodeEntry extends BuiltInNodeEntry<number, NumberFieldSchema> {
    static get type(): "number" {
        return "number";
    }

    static get color(): ColorSource {
        return 0x07b88f;
    }

    static get fieldSchema(): NumberFieldSchema {
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
                initial: 0,
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

    get fieldWidth(): number {
        return 30;
    }

    createFieldElement(label: PreciseText, maxHeight: number): PIXI.Graphics | null {
        const box = new PIXI.Graphics();

        box.lineStyle({ color: this.fieldBorderColor, width: this.fieldBorderWidth });
        box.drawRect(0, 0, this.fieldWidth, maxHeight);

        return box;
    }
}

type NumberFieldSchema = {
    choices: fields.ArrayField<fields.NumberField<number, number, true, false, false>>;
    default: fields.NumberField<number, number, false, false, true>;
    max: fields.NumberField<number, number, false, false, true>;
    min: fields.NumberField<number, number, false, false, true>;
    step: fields.NumberField<number, number, false, false, true>;
};

export { NumberNodeEntry };
export type { NumberFieldSchema };
