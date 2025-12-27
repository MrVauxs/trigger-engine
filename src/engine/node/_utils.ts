import {
    BaseEntrySchema,
    BridgeSchemaInput,
    BridgeSchemaOutput,
    InputEntrySchema,
    NodeData,
    OutputEntrySchema,
    TriggerNode,
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

function parseSchemas<T extends BaseEntrySchema | BridgeSchemaInput>(
    schemas: T[],
    parser: z.ZodObject
): T[] {
    return R.pipe(
        schemas,
        R.map((schema) => parser.safeParse(schema)?.data),
        R.filter(R.isTruthy)
    ) as any;
}

// TODO this needs to also return custom outs
function getOutsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasFilterOptions
): BridgeSchemaOutput[] {
    const rawOuts = NodeCls.defineOuts || (NodeCls.isEvent ? "out" : []);
    const filtered = R.isString(rawOuts)
        ? [{ key: rawOuts }]
        : filterSchemasByState(rawOuts, options);

    return parseSchemas(filtered, zNodeBridgeSchema);
}

function getEntrySchemas<T extends BaseEntrySchema>(
    schemas: T[],
    parser: z.ZodObject,
    options: Exclude<SchemasEntriesFilterOptions, "data">
): T[] {
    const filtered = filterSchemasByState(schemas, options).filter((schema) => {
        return (
            !schema.hidden || options?.revealed === true || options?.revealed?.[schema.key] === true
        );
    });

    return parseSchemas(filtered, parser);
}

// TODO this needs to also return custom inputs
function getInputsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasEntriesFilterOptions
): InputEntrySchema[] {
    return getEntrySchemas(NodeCls.defineInputs ?? [], zNodeInputSchema, {
        revealed: options?.revealed ?? options?.data?.revealed?.inputs,
        state: options?.state,
    });
}

// TODO this needs to also return custom inputs
function getOutputsSchemas(
    NodeCls: typeof TriggerNode,
    options?: SchemasEntriesFilterOptions
): OutputEntrySchema[] {
    return getEntrySchemas(NodeCls.defineOutputs ?? [], zNodeOutputSchema, {
        revealed: options?.revealed ?? options?.data?.revealed?.outputs,
        state: options?.state,
    });
}

function getNodeStates(NodeCls: typeof TriggerNode): string[] | null {
    if (!R.isArray(NodeCls.states)) return null;

    const rawStates = NodeCls.states.filter((state) => R.isString(state));
    return rawStates.length >= 2 ? rawStates : null;
}

type SchemasFilterOptions = {
    state?: string | null;
};

type SchemasEntriesFilterOptions = SchemasFilterOptions & {
    data?: NodeData;
    revealed?: true | Record<string, boolean>;
};

export { getInputsSchemas, getOutputsSchemas, getOutsSchemas, getNodeStates };
