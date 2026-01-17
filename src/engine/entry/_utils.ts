import { z, zString } from "module-helpers";

const zCustomInputValue = z.union([zString, z.number()]).optional();

const zEntrySchemaState = z.union([z.string(), z.array(z.string())]).optional();

const zBaseEntry = z.object({
    input: zCustomInputValue,
    key: zString,
    label: zString.optional(),
    slug: zString.optional(),
    spacing: z.number().default(0),
    state: zEntrySchemaState,
});

type BaseEntry = z.output<typeof zBaseEntry>;

export { zCustomInputValue, zEntrySchemaState, zBaseEntry };
export type { BaseEntry };
