import { NodeData, NodeDataSchema, zNodeDataSchema } from "engine";
import { z, zCollection, zDocument, zID } from "module-helpers";

class TriggerData extends zDocument<TriggerDataSchema> {
    static get defineSchema() {
        return zTriggerDataSchema();
    }

    static get collections() {
        return {
            nodes: NodeData,
        };
    }
}

interface TriggerData extends Omit<z.output<TriggerDataSchema>, "nodes"> {
    readonly _source: TriggerDataInput;
    readonly nodes: zCollection<TriggerData, NodeDataSchema, NodeData>;
}

function zTriggerDataSchema() {
    return z.object({
        id: zID(),
        description: z.string().trim().default(""),
        folder: z.string().trim().default(""),
        name: z.string().trim().default(""),
        nodes: z.array(zNodeDataSchema()).default([]),
        tags: z.array(z.string().trim()).default([]),
    });
}

type TriggerDataInput = z.input<TriggerDataSchema>;
type TriggerDataOutput = z.output<TriggerDataSchema>;

type UpdateTriggerData = Omit<TriggerDataInput, "nodes" | "id">;

type TriggerDataSchema = ReturnType<typeof zTriggerDataSchema>;

export { TriggerData };
export type { TriggerDataOutput, TriggerDataInput, UpdateTriggerData };
