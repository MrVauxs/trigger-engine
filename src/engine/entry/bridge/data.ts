import { NodeData } from "engine";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeBridgeData extends abstract.DataModel<NodeData, BridgeDataSchema> {
    static defineSchema(): BridgeDataSchema {
        return {
            key: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
        };
    }
}

interface NodeBridgeData extends ModelPropsFromSchema<BridgeDataSchema> {
    updateSource(data: DeepPartial<NodeBridgeSource>): DeepPartial<NodeBridgeSource>;
}

type NodeBridgeSource = SourceFromSchema<BridgeDataSchema>;

type BridgeDataSchema = {
    key: fields.StringField<string, string, true, false, false>;
};

export { NodeBridgeData };
