import { z, zString } from "module-helpers";
import { zCustomInputValue, zEntrySchemaState } from "..";

const zNodeBridgeSchema = z.object({
    input: zCustomInputValue,
    key: zString,
    label: zString.optional(),
    slug: zString.optional(),
    spacing: z.number().default(0),
    state: zEntrySchemaState,
});

type BridgeSchemaInput<K extends string = string> = Prettify<
    Omit<z.input<typeof zNodeBridgeSchema>, "key"> & { key: K }
>;
type BridgeSchemaOutput = z.output<typeof zNodeBridgeSchema>;

export { zNodeBridgeSchema };
export type { BridgeSchemaInput, BridgeSchemaOutput };
