import { R, z } from "module-helpers";

const CONNECTION_CATEGORIES = ["outputs", "outs"] as const;
const OPPOSITE_CONNECTION_CATEGORY = ["inputs", "ins"] as const;

const zEntryDataSchema = z
    .record(
        z.string(),
        z.object({
            value: z.unknown().optional(),
            connections: z.array(
                z.string().trim().refine(isConnectionId) as zTypedString<ConnectionId>
            ),
        })
    )
    .default({});

function isOppositeConnection(
    category: PreciseEntryCategory
): category is OppositeConnectionCategory {
    return R.isIncludedIn(category, OPPOSITE_CONNECTION_CATEGORY);
}

function isConnectionId(id: string): id is ConnectionId {
    const args = R.split(id, ":");
    return args.length === 3 && R.isIncludedIn(args.at(1), CONNECTION_CATEGORIES);
}

type ConnectionId = `${string}:${ConnectionCategory}:${string}`;

type ConnectionCategory = (typeof CONNECTION_CATEGORIES)[number];
type OppositeConnectionCategory = (typeof OPPOSITE_CONNECTION_CATEGORY)[number];

type EntryCategory = "inputs" | "outputs";
type PreciseEntryCategory = "inputs" | "outputs" | "ins" | "outs";

type EntryId = `${string}:${PreciseEntryCategory}:${string}`;

export { isConnectionId, isOppositeConnection, zEntryDataSchema };
export type {
    ConnectionCategory,
    ConnectionId,
    EntryCategory,
    EntryId,
    OppositeConnectionCategory,
    PreciseEntryCategory,
};
