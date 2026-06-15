import { CustomOutputSchema } from "engine";
import {
    AnyEntry,
    BaseEntrySchema,
    BooleanEntry,
    InputBooleanEntry,
    InputNumberEntry,
    InputTextEntry,
    ItemEntry,
    NumberEntry,
    PointEntry,
    RegionEntry,
    TargetEntry,
    TextEntry,
    UserEntry,
} from ".";

const builtinsEntries = [
    AnyEntry,
    BooleanEntry,
    ItemEntry,
    NumberEntry,
    PointEntry,
    RegionEntry,
    TargetEntry,
    TextEntry,
    UserEntry,
] as const;

type BuiltinsEntryType = (typeof builtinsEntries)[number]["type"];

type BuiltinsEntryWithField = InputBooleanEntry | InputNumberEntry | InputTextEntry;

type BuiltinsOutputEntry = BaseEntrySchema<BuiltinsEntryType>;

type BuiltinsInputEntry =
    | BaseEntrySchema<Exclude<BuiltinsEntryType, BuiltinsEntryWithField["type"]>>
    | BuiltinsEntryWithField;

type BuiltinsCustomEntry = Prettify<
    Omit<CustomOutputSchema, "types"> & {
        types?: BuiltinsEntryType[];
    }
>;

export { builtinsEntries };
export type { BuiltinsCustomEntry, BuiltinsInputEntry, BuiltinsOutputEntry };
