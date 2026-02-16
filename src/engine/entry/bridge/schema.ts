import { z } from "foundry-helpers";
import { zBaseEntry } from "..";

const zNodeBridgeSchema = zBaseEntry;

type BridgeSchemaInput<K extends string = string> = Prettify<
    Omit<z.input<typeof zNodeBridgeSchema>, "key"> & { key: K }
>;
type BridgeSchemaOutput = z.output<typeof zNodeBridgeSchema>;

export { zNodeBridgeSchema };
export type { BridgeSchemaInput, BridgeSchemaOutput };
