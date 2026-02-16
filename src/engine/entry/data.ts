import { R, z } from "foundry-helpers";

const CONNECTION_CATEGORIES = ["outputs", "ins"] as const;
const OPPOSITE_CONNECTION_CATEGORY = ["inputs", "outs"] as const;

const zConnectionId = z.string().trim().refine(isConnectionId) as z.core.$ZodType<ConnectionId>;

const zEntryDataSchema = z
    .record(
        z.string(),
        z.object({
            value: z.unknown().optional(),
            connection: z.optional(zConnectionId),
        }),
    )
    .default(() => ({}));

function isOppositeConnection(category: PreciseEntryCategory): category is OppositeConnectionCategory {
    return R.isIncludedIn(category, OPPOSITE_CONNECTION_CATEGORY);
}

function isConnectionId(id: string): id is ConnectionId {
    const args = R.split(id, ":");
    return args.length === 3 && R.isIncludedIn(args.at(1), CONNECTION_CATEGORIES);
}

function splitEntryId<T extends PreciseEntryCategory>(
    id: `${string}:${T}:${string}`,
): [nodeId: string, category: T, key: string] {
    return R.split(id, ":") as any;
}

type ConnectionId = `${string}:${ConnectionCategory}:${string}`;

type ConnectionCategory = (typeof CONNECTION_CATEGORIES)[number];
type OppositeConnectionCategory = (typeof OPPOSITE_CONNECTION_CATEGORY)[number];

type EntryCategory = "inputs" | "outputs";
type PreciseEntryCategory = "inputs" | "outputs" | "ins" | "outs";

type EntryId = `${string}:${PreciseEntryCategory}:${string}`;

export {
    isConnectionId,
    isOppositeConnection,
    OPPOSITE_CONNECTION_CATEGORY,
    splitEntryId,
    zConnectionId,
    zEntryDataSchema,
};
export type {
    ConnectionCategory,
    ConnectionId,
    EntryCategory,
    EntryId,
    OppositeConnectionCategory,
    PreciseEntryCategory,
};
