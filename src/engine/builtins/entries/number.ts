import { BaseNodeInput } from "engine";
import { BuiltInNodeEntry } from ".";
import fields = foundry.data.fields;

class NumberNodeEntry extends BuiltInNodeEntry<NumberFieldSchema> {
    static get type(): "number" {
        return "number";
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
}

type NumberEntry = BaseNodeInput<"number", NumberFieldSchema>;

type NumberFieldSchema = {
    choices: fields.ArrayField<fields.NumberField<number, number, true, false, false>>;
    default: fields.NumberField<number, number, false, false, true>;
    max: fields.NumberField<number, number, false, false, true>;
    min: fields.NumberField<number, number, false, false, true>;
    step: fields.NumberField<number, number, false, false, true>;
};

export { NumberNodeEntry };
