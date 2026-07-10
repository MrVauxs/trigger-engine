import { BaseEntrySchema, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";
import { InputOutcomeEntry, InputRankEntry, OutcomEntry, RankEntry } from ".";

const pf2eEntries = [OutcomEntry, RankEntry] as const;

type PF2eEntryType = (typeof pf2eEntries)[number]["type"];

type PF2eEntryWithField = InputOutcomeEntry | InputRankEntry;

type PF2eOutputEntry = BuiltinsOutputEntry | BaseEntrySchema<PF2eEntryType>;

type PF2eInputEntry =
    BuiltinsInputEntry | PF2eEntryWithField | BaseEntrySchema<Exclude<PF2eEntryType, PF2eEntryWithField["type"]>>;

export { pf2eEntries };
export type { PF2eInputEntry, PF2eOutputEntry };
