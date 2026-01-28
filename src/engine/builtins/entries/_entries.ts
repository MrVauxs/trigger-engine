import { CustomOutputSchema } from "engine";
import { R } from "module-helpers";
import {
    AnyEntry,
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

const builtinsEntries = [AnyEntry, BooleanEntry, ItemEntry, NumberEntry, TargetEntry, TextEntry, UserEntry] as const;

const builtinsEntryTypes = R.pipe(
    builtinsEntries,
    R.map((entry) => entry.type),
    R.filter((entry) => entry !== "any"),
);

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

export { builtinsEntries, builtinsEntryTypes };
export type { BuiltinsCustomEntry, BuiltinsInputEntry, BuiltinsOutputEntry };
