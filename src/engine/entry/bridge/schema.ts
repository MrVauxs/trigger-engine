import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeBridgeSchema extends abstract.DataModel<null, BridgeSchemaSchema> {
    static defineSchema(): BridgeSchemaSchema {
        return {
            key: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
            label: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
                initial: undefined,
            }),
        };
    }
}

interface NodeBridgeSchema extends ModelPropsFromSchema<BridgeSchemaSchema> {}

type BridgeSchema = Prettify<WithPartial<SourceFromSchema<BridgeSchemaSchema>, "label">>;

type BridgeSchemaSchema = {
    key: fields.StringField<string, string, true, false, false>;
    label: fields.StringField<string, string, false, false, false>;
};

export { NodeBridgeSchema };
export type { BridgeSchema };
