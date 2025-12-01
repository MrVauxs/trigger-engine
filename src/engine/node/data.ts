import { TriggerData } from "engine";
import { IdField } from "module-helpers";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeData extends abstract.DataModel<TriggerData, NodeDataSchema> {
    static defineSchema(): NodeDataSchema {
        return {
            _id: new IdField(),
            builtin: new fields.BooleanField({
                readonly: true,
                required: false,
                nullable: false,
                initial: false,
            }),
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

interface NodeData extends ModelPropsFromSchema<NodeDataSchema> {}

type NodeDataSource = SourceFromSchema<NodeDataSchema>;

type NodeDataSchema = {
    _id: IdField;
    builtin: fields.BooleanField<boolean, boolean, false, false, true>;
    type: fields.StringField<string, string, true, false, false>;
};

export { NodeData };
export type { NodeDataSchema, NodeDataSource };
