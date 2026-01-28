import { z, zString } from "module-helpers";
import { zBaseEntry } from ".";

const zNodeEntrySchema = zBaseEntry.extend({
    group: zString.optional(),
    isArray: z.boolean().default(false),
    tooltip: z.union([z.boolean(), z.string()]).default(true),
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
    InputEntrySchema,
    InputEntrySchemaSource,
    OutputEntrySchema,
    OutputEntrySchemaSource,
};
