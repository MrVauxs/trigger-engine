import { BaseEntrySchema, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";
import { InputOutcomeEntry, OutcomEntry } from ".";

const pf2eEntries = [OutcomEntry] as const;

const pf2eEntryTypes = pf2eEntries.map((entry) => entry.type);

type PF2eEntryType = (typeof pf2eEntries)[number]["type"];

type PF2eEntryWithField = InputOutcomeEntry;

type PF2eOutputEntry = BuiltinsOutputEntry | BaseEntrySchema<PF2eEntryType>;

type PF2eInputEntry =
    | BuiltinsInputEntry
    | PF2eEntryWithField
    | BaseEntrySchema<Exclude<PF2eEntryType, PF2eEntryWithField["type"]>>;

export { pf2eEntries, pf2eEntryTypes };
export type { PF2eInputEntry, PF2eOutputEntry };
