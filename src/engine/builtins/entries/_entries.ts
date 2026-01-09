import {
    BaseEntrySchema,
    BooleanEntry,
    InputBooleanEntry,
    InputNumberEntry,
    InputTextEntry,
    NumberEntry,
    TargetEntry,
    TextEntry,
    UserEntry,
} from ".";

const builtinsEntries = [BooleanEntry, NumberEntry, TargetEntry, TextEntry, UserEntry] as const;

type BuiltinsEntryType = (typeof builtinsEntries)[number]["type"];

type BuiltinsEntryWithField = InputBooleanEntry | InputNumberEntry | InputTextEntry;

type BuiltinsOutputEntry = BaseEntrySchema<BuiltinsEntryType>;

type BuiltinsInputEntry =
    | BaseEntrySchema<Exclude<BuiltinsEntryType, BuiltinsEntryWithField["type"]>>
    | BuiltinsEntryWithField;

export { builtinsEntries };
export type { BuiltinsInputEntry, BuiltinsOutputEntry };
