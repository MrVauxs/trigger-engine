import { IdField } from "module-helpers";
import { NodeData } from "..";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeEntryData extends abstract.DataModel<NodeData, NodeEntrySchema> {
    static defineSchema(): NodeEntrySchema {
        return {
            _id: new IdField(),
            type: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
        };
    }

    get id(): string {
        return this._id;
    }
}

interface NodeEntryData extends ModelPropsFromSchema<NodeEntrySchema> {
    updateSource(data: DeepPartial<NodeEntrySource>): DeepPartial<NodeEntrySource>;
}

type NodeEntrySource = SourceFromSchema<NodeEntrySchema>;

type NodeEntrySchema = {
    _id: IdField;
    type: fields.StringField<string, string, true, false, false>;
};

export { NodeEntryData };
export type { NodeEntrySource };
