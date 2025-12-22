import { ConnectionCategory, ConnectionId, NodeEntryField, TriggerData } from "engine";
import { IdField, PositionField } from "module-helpers";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeData extends abstract.DataModel<TriggerData, NodeDataSchema> {
    static defineSchema(): NodeDataSchema {
        return {
            _id: new IdField(),
            inputs: new fields.TypedObjectField(new NodeEntryField("outputs")),
            ins: new fields.TypedObjectField(new NodeEntryField("outs")),
            position: new PositionField(),
            state: new fields.StringField({
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

    get id(): string {
        return this._id;
    }
}

interface NodeData extends ModelPropsFromSchema<NodeDataSchema> {
    updateSource(
        data: DeepPartial<NodeDataSource> | { [x: string]: { [x: string]: null } }
    ): DeepPartial<NodeDataSource>;
}

type CreateNodeData = Prettify<WithRequired<DeepPartial<NodeDataSource>, "type">>;

type UpdateNodeData = DeepPartial<Omit<NodeDataSource, "_id" | "builtin" | "type">>;

type NodeDataSource = SourceFromSchema<NodeDataSchema>;

type NodeDataSchema = {
    _id: IdField;
    inputs: EntryFields<"outputs">;
    ins: EntryFields<"outs">;
    position: PositionField;
    state: fields.StringField<string, string, false, false, false>;
    type: fields.StringField<string, string, true, false, false>;
};

type EntryFields<TCategory extends ConnectionCategory> = fields.TypedObjectField<
    NodeEntryField<TCategory>,
    Record<string, { connections?: ConnectionId[]; value?: any }>,
    Record<string, { connections?: ConnectionId[]; value?: any }>,
    false
>;

export { NodeData };
export type { CreateNodeData, NodeDataSchema, NodeDataSource, UpdateNodeData };
