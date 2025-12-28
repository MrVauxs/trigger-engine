import { zCustomInputData, zCustomOutData, zCustomOutputData, zEntryDataSchema } from "engine";
import { z, zDocument, zID, zPosition, zString } from "module-helpers";

class NodeData extends zDocument<NodeDataSchema> {
    static get defineSchema() {
        return zNodeDataSchema;
    }
}

interface NodeData extends z.output<NodeDataSchema> {
    readonly _source: NodeDataInput;
}

const zRevealedRecord = z.record(zString, z.boolean()).default({});
const zRevealed = z.object({
    inputs: zRevealedRecord,
    outputs: zRevealedRecord,
});

const zCustoms = z.object({
    outs: z.record(zString, zCustomOutData).default({}),
    inputs: z.record(zString, zCustomInputData).default({}),
    outputs: z.record(zString, zCustomOutputData).default({}),
});

const zNodeDataSchema = z.object({
    custom: zCustoms.default({ outs: {}, inputs: {}, outputs: {} }),
    id: zID,
    inputs: zEntryDataSchema,
    outs: zEntryDataSchema,
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
