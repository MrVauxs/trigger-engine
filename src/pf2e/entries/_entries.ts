import { BaseEntrySchema, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";
import { OutcomEntry } from ".";

const pf2eEntries = [OutcomEntry] as const;

type pf2eEntryType = (typeof pf2eEntries)[number]["type"];

type PF2eOutputEntry = BuiltinsOutputEntry | BaseEntrySchema<pf2eEntryType>;

type PF2eInputEntry = BuiltinsInputEntry | BaseEntrySchema<pf2eEntryType>;

export { pf2eEntries };
export type { PF2eInputEntry, PF2eOutputEntry };
