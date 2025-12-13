import { ConnectionCategory, EntryConnectionField } from ".";
import fields = foundry.data.fields;

class NodeEntryField<TCategory extends ConnectionCategory> extends fields.SchemaField {
    constructor(
        category: TCategory,
        options?: fields.DataFieldOptions<SourceFromSchema<EntryDataSchema>, true, false, true>,
        context?: fields.DataFieldContext
    ) {
        super(
            {
                connections: new fields.ArrayField(new EntryConnectionField({ category }), {
                    required: false,
                    nullable: false,
                    initial: () => [],
                }),
                value: new fields.AnyField({
                    required: false,
                    nullable: true,
                    initial: undefined,
                }),
            } satisfies EntryDataSchema,
            options,
            context
        );
    }

    static get _defaults() {
        return Object.assign(super._defaults, {
            required: false,
            nullable: false,
        });
    }
}

type EntryDataSchema = {
    connections: fields.ArrayField<EntryConnectionField>;
    value: fields.AnyField<false, true, false>;
};

export { NodeEntryField };
