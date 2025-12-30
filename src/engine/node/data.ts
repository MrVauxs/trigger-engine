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

const zNodeCustoms = z
    .object({
        title: z.string().optional(),
        inputs: z.record(zString, zCustomInputData).default({}),
        outputs: z.record(zString, zCustomOutputData).default({}),
        outs: z.record(zString, zCustomOutData).default({}),
    })
    .default({ outs: {}, inputs: {}, outputs: {} });

const zNodeDataSchema = z.object({
    custom: zNodeCustoms,
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

export { NodeData, zNodeDataSchema, zNodeCustoms };
export type { CreateNodeData, NodeDataInput, NodeDataOutput, NodeDataSchema };
