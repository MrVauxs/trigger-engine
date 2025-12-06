import { TriggerData } from "engine";
import { IdField, PositionField } from "module-helpers";
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
            position: new PositionField(),
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

interface NodeData extends ModelPropsFromSchema<NodeDataSchema> {
    updateSource(data: DeepPartial<NodeDataSource>): DeepPartial<NodeDataSource>;
}

type CreateNodeData = DeepPartial<WithRequired<NodeDataSource, "type">>;

type UpdateNodeData = DeepPartial<Omit<NodeDataSource, "_id" | "builtin" | "type">>;

type NodeDataSource = SourceFromSchema<NodeDataSchema>;

type NodeDataSchema = {
    _id: IdField;
    builtin: fields.BooleanField<boolean, boolean, false, false, true>;
    position: PositionField;
    type: fields.StringField<string, string, true, false, false>;
};

export { NodeData };
export type { CreateNodeData, NodeDataSchema, NodeDataSource, UpdateNodeData };
