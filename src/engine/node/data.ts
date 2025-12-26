import { zEntryDataSchema } from "engine";
import { z, zDocument, zID, zPosition, zString } from "module-helpers";

class NodeData extends zDocument<NodeDataSchema> {
    static get defineSchema() {
        return zNodeDataSchema;
    }
}

interface NodeData extends z.output<NodeDataSchema> {
    readonly _source: NodeDataInput;
}

const zRevealed = z.object({
    inputs: z.record(zString, z.boolean()).default({}),
    outputs: z.record(zString, z.boolean()).default({}),
});

const zNodeDataSchema = z.object({
    id: zID,
    inputs: zEntryDataSchema,
    ins: zEntryDataSchema,
    position: zPosition,
    revealed: zRevealed.default({ inputs: {}, outputs: {} }),
    state: z.string().trim().optional(),
    type: z.string().trim().readonly(),
});

type NodeDataInput = z.input<NodeDataSchema>;
type NodeDataOutput = z.output<NodeDataSchema>;

type NodeDataSchema = typeof zNodeDataSchema;

type CreateNodeData = z.input<NodeDataSchema>;

export { NodeData, zNodeDataSchema };
export type { CreateNodeData, NodeDataInput, NodeDataOutput, NodeDataSchema };
