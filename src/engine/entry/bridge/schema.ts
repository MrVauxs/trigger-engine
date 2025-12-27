import { z, zString } from "module-helpers";

const zNodeBridgeSchema = z.object({
    key: zString,
    label: zString.optional(),
    state: zString.optional(),
});

type BridgeSchemaInput = z.infer<typeof zNodeBridgeSchema>;
type BridgeSchemaOutput = z.output<typeof zNodeBridgeSchema>;

export { zNodeBridgeSchema };
export type { BridgeSchemaInput, BridgeSchemaOutput };
