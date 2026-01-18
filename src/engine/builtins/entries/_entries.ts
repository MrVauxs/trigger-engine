import { CustomOutputSchema } from "engine";
import {
    BaseEntrySchema,
    BooleanEntry,
    InputBooleanEntry,
    InputNumberEntry,
    InputTextEntry,
    ItemEntry,
    NumberEntry,
    TargetEntry,
    TextEntry,
    UserEntry,
} from ".";

const builtinsEntries = [BooleanEntry, ItemEntry, NumberEntry, TargetEntry, TextEntry, UserEntry] as const;

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
