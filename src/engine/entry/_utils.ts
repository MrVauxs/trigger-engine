import { z } from "foundry-helpers";

const zCustomInputValue = z.union([z.string().trim().min(1), z.number()]).optional();

const zEntrySchemaState = z.union([z.string(), z.array(z.string())]).optional();

const zBaseEntry = z.object({
    input: zCustomInputValue,
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    spacing: z.number().default(0),
    state: zEntrySchemaState,
    tooltip: z.union([z.boolean(), z.string()]).default(true),
});

type BaseEntry = z.output<typeof zBaseEntry>;

export { zCustomInputValue, zEntrySchemaState, zBaseEntry };
export type { BaseEntry };
