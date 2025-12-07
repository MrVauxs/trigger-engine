import { DataUnionField, R, SchemaField } from "module-helpers";
import fields = foundry.data.fields;

class NodeIconField extends DataUnionField<
    fields.StringField | SchemaField<IconObjectSchema, false, false, false>,
    IconObject,
    false,
    true,
    false
> {
    constructor() {
        super(
            [
                new fields.StringField<string>({
                    required: false,
                    nullable: false,
                    blank: false,
                }),
                new fields.SchemaField<
                    IconObjectSchema,
                    SourceFromSchema<IconObjectSchema>,
                    ModelPropsFromSchema<IconObjectSchema>,
                    false,
                    false,
                    false
                >(
                    {
                        unicode: new fields.StringField<string, string, true>({
                            required: true,
                            nullable: false,
                            blank: false,
                            readonly: true,
                        }),
                        fontSize: new fields.NumberField({
                            required: false,
                            nullable: false,
                            readonly: true,
                            initial: undefined,
                            min: 0.1,
                        }),
                        fontWeight: new fields.StringField<
                            TextStyleFontWeight,
                            TextStyleFontWeight,
                            false,
                            false,
                            false
                        >({
                            required: false,
                            nullable: false,
                            blank: false,
                            readonly: true,
                            initial: undefined,
                        }),
                    },
                    {
                        required: false,
                        nullable: false,
                    }
                ),
            ],
            {
                required: false,
                nullable: true,
                initial: undefined,
            }
        );
    }

    _cast(value?: unknown): unknown {
        if (R.isString(value)) {
            return {
                unicode: value,
                fontSize: undefined,
                fontWeight: undefined,
            } satisfies IconObject;
        }

        return value;
    }
}

type IconObjectSchema = {
    unicode: fields.StringField<string, string, true>;
    fontSize: fields.NumberField<number, number, false, false, false>;
    fontWeight: fields.StringField<TextStyleFontWeight, TextStyleFontWeight, false, false, false>;
};

type IconObject = Prettify<
    WithPartial<ModelPropsFromSchema<IconObjectSchema>, "fontSize" | "fontWeight">
>;

export { NodeIconField };
export type { IconObject };
