import { z } from "foundry-helpers";
import { zBaseEntry } from ".";

const zNodeEntrySchema = zBaseEntry.extend({
    group: z.string().trim().min(1).optional(),
    isArray: z.boolean().default(false),
    tooltip: z.union([z.boolean(), z.string()]).default(true),
    type: z.string().trim().min(1),
});

const zNodeOutputSchema = zNodeEntrySchema;

const zNodeInputSchema = zNodeEntrySchema.extend({
    field: z.record(z.string().trim().min(1), z.any()).optional(),
});

type BaseEntrySchemaInput = z.input<typeof zNodeEntrySchema>;
type BaseEntrySchemaOutput = z.output<typeof zNodeEntrySchema>;

type OutputEntrySchemaSource = BaseEntrySchemaInput;
type OutputEntrySchema = BaseEntrySchemaOutput;

type InputEntrySchemaSource<TField extends Record<string, any> | undefined = any> = Prettify<
    BaseEntrySchemaInput & {
        field?: TField;
    }
>;
type InputEntrySchema<TField extends Record<string, any> | undefined = any> = Prettify<
    BaseEntrySchemaOutput & {
        field?: TField;
    }
>;

export { zNodeInputSchema, zNodeOutputSchema };
export type {
    BaseEntrySchemaInput,
    BaseEntrySchemaOutput,
    InputEntrySchema,
    InputEntrySchemaSource,
    OutputEntrySchema,
    OutputEntrySchemaSource,
};
