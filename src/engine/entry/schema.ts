import { EntryField } from "./entry";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeEntrySchema extends abstract.DataModel<null, EntrySchemaSchema> {
    static defineSchema(): EntrySchemaSchema {
        return {
            isArray: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: false,
            }),
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
            group: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
                initial: undefined,
            }),
            type: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
        };
    }
}

interface NodeEntrySchema extends ModelPropsFromSchema<EntrySchemaSchema> {}

type NodeEntrySchemaSource = SourceFromSchema<EntrySchemaSchema>;

type EntrySchemaSchema = {
    isArray: fields.BooleanField<boolean, boolean, false, false, true>;
    key: fields.StringField<string, string, true, false, false>;
    label: fields.StringField<string, string, false, false, false>;
    group: fields.StringField<string, string, false, false, false>;
    type: fields.StringField<string, string, true, false, false>;
};

type BaseEntrySchema = Prettify<WithPartial<NodeEntrySchemaSource, "label" | "group">>;

type OutputEntrySchema = BaseEntrySchema;

type InputEntrySchema<TFieldSchema extends fields.DataSchema | undefined = any> =
    BaseEntrySchema & {
        field?: EntryField<TFieldSchema>;
    };

export { NodeEntrySchema };
export type { BaseEntrySchema, NodeEntrySchemaSource, InputEntrySchema, OutputEntrySchema };
