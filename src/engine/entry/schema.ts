import { z, zString } from "module-helpers";

const zNodeEntrySchema = z.object({
    isArray: z.boolean().default(false),
    key: zString,
    label: zString.optional(),
    group: zString.optional(),
    slug: zString.optional(),
    state: zString.optional(),
    type: zString,
});

const zNodeOutputSchema = zNodeEntrySchema;

const zNodeInputSchema = zNodeEntrySchema.extend({
    field: z.record(zString, z.any()).optional(),
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
    InputEntrySchemaSource,
    InputEntrySchema,
    OutputEntrySchemaSource,
    OutputEntrySchema,
};
