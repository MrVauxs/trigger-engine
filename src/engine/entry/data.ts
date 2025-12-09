import { NodeData } from "..";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeEntryData extends abstract.DataModel<NodeData, EntryDataSchema> {
    static defineSchema(): EntryDataSchema {
        return {
            key: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
            type: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
        };
    }
}

interface NodeEntryData extends ModelPropsFromSchema<EntryDataSchema> {
    updateSource(data: DeepPartial<NodeEntrySource>): DeepPartial<NodeEntrySource>;
}

type NodeEntrySource = SourceFromSchema<EntryDataSchema>;

type EntryDataSchema = {
    key: fields.StringField<string, string, true, false, false>;
    type: fields.StringField<string, string, true, false, false>;
};

export { NodeEntryData };
export type { NodeEntrySource };
