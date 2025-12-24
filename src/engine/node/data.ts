import { zEntryDataSchema } from "engine";
import { z, zDocument, zID, zPosition } from "module-helpers";

class NodeData extends zDocument<NodeDataSchema> {
    static get defineSchema() {
        return zNodeDataSchema();
    }
}

interface NodeData extends z.output<NodeDataSchema> {
    readonly _source: NodeDataInput;
}

function zNodeDataSchema() {
    return z.object({
        id: zID(),
        inputs: zEntryDataSchema(),
        ins: zEntryDataSchema(),
        position: zPosition(),
        state: z.string().trim().optional(),
        type: z.string().trim().readonly(),
    });
}

type NodeDataInput = z.input<NodeDataSchema>;
type NodeDataOutput = z.output<NodeDataSchema>;

type NodeDataSchema = ReturnType<typeof zNodeDataSchema>;

type CreateNodeData = z.input<NodeDataSchema>;

export { NodeData, zNodeDataSchema };
export type { CreateNodeData, NodeDataInput, NodeDataOutput, NodeDataSchema };
