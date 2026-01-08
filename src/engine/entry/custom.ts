import { z, zID, zString } from "module-helpers";

// data

const zBaseData = z.object({
    id: zID,
    input: z.union([zString, z.number()]).optional(),
    label: zString,
    slug: zString,
});

const zBaseEntryData = zBaseData.extend({
    isArray: z.boolean().optional().catch(false),
    type: zString,
});

type BaseCustomData = z.input<typeof zBaseData>;

type BaseCustomEntryDataSource = z.input<typeof zBaseEntryData>;
type BaseCustomEntryData = z.output<typeof zBaseEntryData>;

// schema

const zInputField = z.object({
    isNumber: z.boolean().default(false),
    label: zString.optional(),
    placeholder: zString.optional(),
    replaceLabel: z.boolean().default(false),
});

const zBaseSchema = z.object({
    input: zInputField.optional(),
    label: zString.optional(),
    slug: zString,
});

const zBaseEntrySchema = zBaseSchema.extend({
    array: z.boolean().default(false),
    group: zString.optional(),
    tooltip: z.string().trim().optional(),
    types: z.array(zString).default(() => []),
});

type BaseCustomSchema = z.input<typeof zBaseSchema>;

type BaseCustomEntrySchema = z.input<typeof zBaseEntrySchema>;

// out

const zCustomOutData = zBaseData;

const zCustomOutSchema = zBaseSchema;

type CustomOutData = z.input<typeof zCustomOutData>;

type CustomOutSchema = z.input<typeof zCustomOutSchema>;

// output

const zCustomOutputData = zBaseEntryData;

const zCustomOutputSchema = zBaseEntrySchema;

type CustomOutputData = z.input<typeof zCustomOutputData>;

type CustomOutputSchema = z.input<typeof zCustomOutputSchema>;

// input

const zCustomInputData = zBaseEntryData;

const zCustomInputSchema = zBaseEntrySchema;

type CustomInputData = z.input<typeof zCustomInputData>;

type CustomInputSchema<TFieldSchema extends Record<string, any> | undefined = any> = Prettify<
    z.input<typeof zCustomInputSchema> & {
        field?: TFieldSchema;
    }
>;

export {
    zBaseEntrySchema,
    zCustomInputData,
    zCustomInputSchema,
    zCustomOutData,
    zCustomOutputData,
    zCustomOutputSchema,
    zCustomOutSchema,
};
export type {
    BaseCustomData,
    BaseCustomEntryData,
    BaseCustomEntryDataSource,
    BaseCustomEntrySchema,
    BaseCustomSchema,
    CustomInputData,
    CustomInputSchema,
    CustomOutData,
    CustomOutputData,
    CustomOutputSchema,
    CustomOutSchema,
};
