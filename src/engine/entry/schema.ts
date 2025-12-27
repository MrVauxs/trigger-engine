import { z, zString } from "module-helpers";

const zNodeEntrySchema = z.object({
    hidden: z.boolean().default(false),
    isArray: z.boolean().default(false),
    key: zString,
    label: zString.optional(),
    group: zString.optional(),
    state: zString.optional(),
    type: zString,
});

const zNodeOutputSchema = zNodeEntrySchema;

const zNodeInputSchema = zNodeEntrySchema.extend({
    field: z.record(zString, z.any()).optional(),
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
