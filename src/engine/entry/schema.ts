import { z, zString } from "module-helpers";

function zNodeEntrySchema() {
    return z.object({
        isArray: z.boolean().optional().catch(false),
        key: zString(),
        label: zString().optional().catch(undefined),
        group: zString().optional().catch(undefined),
        state: zString().optional().catch(undefined),
        type: zString(),
    });
}

type NodeEntrySchemaSource = z.input<ReturnType<typeof zNodeEntrySchema>>;

type BaseEntrySchema = NodeEntrySchemaSource;

type OutputEntrySchema = BaseEntrySchema;

type InputEntrySchema<TField extends Record<string, any> | undefined = any> = Prettify<
    BaseEntrySchema & {
        field?: TField;
    }
>;

export { zNodeEntrySchema };
export type { BaseEntrySchema, InputEntrySchema, NodeEntrySchemaSource, OutputEntrySchema };
