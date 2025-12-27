import {
    BaseCustomData,
    BaseCustomEntryData,
    BaseCustomEntrySchema,
    BaseEntrySchemaInput,
    BridgeSchemaInput,
    BridgeSchemaOutput,
    CustomInputSchema,
    InputEntrySchemaOutput,
    NodeData,
    OutputEntrySchemaOutput,
    TriggerNode,
    zBaseEntrySchema,
    zCustomInputSchema,
    zCustomOutputSchema,
    zCustomOutSchema,
    zNodeBridgeSchema,
    zNodeInputSchema,
    zNodeOutputSchema,
} from "engine";
import { R, z } from "module-helpers";

function filterSchemasByState<T extends { state?: string }>(
    schemas: T[],
    { state }: { state?: string | null } = {}
): T[] {
    return state ? schemas.filter((schema) => !schema.state || schema.state === state) : schemas;
}

function parseSchemas<T extends BaseEntrySchemaInput | BridgeSchemaInput>(
    schemas: T[],
    parser: z.ZodObject
): T[] {
    return R.pipe(
        schemas,
        R.map((schema) => parser.safeParse(schema)?.data),
        R.filter(R.isTruthy)
    ) as any;
}

function filterByCustomSchemas<
    TParser extends z.ZodObject<{ slug: z.ZodString }>,
    TEntry extends BaseCustomData,
    TReturnSchema extends BaseEntrySchemaInput | BridgeSchemaInput,
    TSchema extends z.output<TParser> = z.output<TParser>
>(
    rawSchemas: z.input<TParser>[] | null,
    schemaParser: TParser,
    entries: TEntry[],
    callback: (schema: TSchema, entry: TEntry) => TReturnSchema
): TReturnSchema[] {
    if (!entries.length) {
        return [];
    }

    const customSchemas = R.pipe(
        rawSchemas ?? [],
        R.map((schema): TSchema | undefined => {
            return schemaParser.safeParse(schema)?.data as TSchema | undefined;
        }),
        R.filter(R.isTruthy),
        R.indexBy(R.prop("slug"))
    ) as Record<string, TSchema>;

    return R.pipe(
        entries,
        R.map((entry) => {
            const schema = customSchemas[entry.slug];
            return schema && callback(schema, entry);
        }),
        R.filter(R.isTruthy)
    );
}

function getOutsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasFilterOptions
): BridgeSchemaOutput[] {
    const schemas = NodeCls.defineOuts || (NodeCls.isEvent ? "out" : []);
    const filtered = R.isString(schemas)
        ? [{ key: schemas }]
        : filterSchemasByState(schemas, options);

    if (options?.data) {
        filtered.push(
            ...filterByCustomSchemas(
                NodeCls.defineCustomOuts,
                zCustomOutSchema,
                options.data.custom.outs,
                (_, entry): BridgeSchemaOutput => {
                    return {
                        key: entry.id,
                        label: entry.label,
                        slug: entry.slug,
                    };
                }
            )
        );
    }

    return parseSchemas(filtered, zNodeBridgeSchema);
}

function getEntrySchemas<T extends BaseEntrySchemaInput>(
    schemas: T[] | null,
    parser: z.ZodObject,
    options: SchemasFilterOptions,
    custom: {
        rawSchemas: BaseCustomEntrySchema[] | null;
        schemaParser: typeof zBaseEntrySchema;
        entries: BaseCustomEntryData[] | undefined;
    }
): T[] {
    const filtered = filterSchemasByState(schemas ?? [], options).filter((schema) => {
        return (
            !schema.hidden || options?.revealed === true || options?.revealed?.[schema.key] === true
        );
    });

    if (options?.data) {
        filtered.push(
            ...filterByCustomSchemas(
                custom.rawSchemas,
                custom.schemaParser,
                custom.entries ?? [],
                (schema, entry): T => {
                    return {
                        field: (schema as CustomInputSchema).field,
                        group: schema.group,
                        isArray: entry.isArray,
                        key: entry.id,
                        label: entry.label,
                        slug: entry.slug,
                        type: entry.type,
                    } as any;
                }
            )
        );
    }

    return parseSchemas(filtered, parser);
}

function getInputsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasFilterOptions
): InputEntrySchemaOutput[] {
    return getEntrySchemas(
        NodeCls.defineInputs,
        zNodeInputSchema,
        {
            ...options,
            revealed: options?.revealed ?? options?.data?.revealed?.inputs,
        },
        {
            entries: options?.data?.custom.inputs,
            rawSchemas: NodeCls.defineCustomInputs,
            schemaParser: zCustomInputSchema,
        }
    );
}

function getOutputsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasFilterOptions
): OutputEntrySchemaOutput[] {
    return getEntrySchemas(
        NodeCls.defineOutputs,
        zNodeOutputSchema,
        {
            ...options,
            revealed: options?.revealed ?? options?.data?.revealed?.outputs,
        },
        {
            entries: options?.data?.custom.outputs,
            rawSchemas: NodeCls.defineCustomOutputs,
            schemaParser: zCustomOutputSchema,
        }
    );
}

function getNodeStates(NodeCls: typeof TriggerNode): string[] | null {
    if (!R.isArray(NodeCls.states)) return null;

    const rawStates = NodeCls.states.filter((state) => R.isString(state));
    return rawStates.length >= 2 ? rawStates : null;
}

type SchemasFilterOptions = {
    state?: string | null;
    data?: NodeData;
    revealed?: true | Record<string, boolean>;
};

export { getInputsSchemas, getNodeStates, getOutputsSchemas, getOutsSchemas };
