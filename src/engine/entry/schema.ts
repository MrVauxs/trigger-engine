import { z, zString } from "module-helpers";

const zNodeEntrySchema = z.object({
    hidden: z.boolean().optional().catch(false),
    isArray: z.boolean().optional().catch(false),
    key: zString,
    label: zString.optional().catch(undefined),
    group: zString.optional().catch(undefined),
    state: zString.optional().catch(undefined),
    type: zString,
});

const zNodeOutputSchema = zNodeEntrySchema;

const zNodeInputSchema = zNodeEntrySchema.extend({
    field: z.record(zString, z.any()).optional().catch(undefined),
});

type BaseEntrySchema = z.input<typeof zNodeEntrySchema>;

type OutputEntrySchema = BaseEntrySchema;

type InputEntrySchema<TField extends Record<string, any> | undefined = any> = Prettify<
    BaseEntrySchema & {
        field?: TField;
    }
>;

export { zNodeOutputSchema, zNodeInputSchema };
export type { BaseEntrySchema, InputEntrySchema, OutputEntrySchema };
