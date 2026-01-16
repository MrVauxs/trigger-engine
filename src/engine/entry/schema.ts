import { z, zString } from "module-helpers";
import { zCustomInputValue } from ".";

const zEntrySchemaState = z.union([z.string(), z.array(z.string())]).optional();

const zBaseEntry = z.object({
    input: zCustomInputValue,
    key: zString,
    label: zString.optional(),
    slug: zString.optional(),
    spacing: z.number().default(0),
    state: zEntrySchemaState,
});

const zNodeEntrySchema = zBaseEntry.extend({
    group: zString.optional(),
    isArray: z.boolean().default(false),
    type: zString,
});

const zNodeOutputSchema = zNodeEntrySchema;

const zNodeInputSchema = zNodeEntrySchema.extend({
    field: z.record(zString, z.any()).optional(),
});

type BaseEntry = z.output<typeof zBaseEntry>;

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

export { zBaseEntry, zEntrySchemaState, zNodeInputSchema, zNodeOutputSchema };
export type {
    BaseEntry,
    BaseEntrySchemaInput,
    BaseEntrySchemaOutput,
    InputEntrySchema,
    InputEntrySchemaSource,
    OutputEntrySchema,
    OutputEntrySchemaSource,
};
