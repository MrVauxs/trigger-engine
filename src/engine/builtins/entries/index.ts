import { BaseEntrySchema } from ".";
import { InputTextEntry, OutputTextEntry } from ".";

export * from "./base";
export * from "./boolean";
export * from "./fields";
export * from "./number";
export * from "./target";
export * from "./text";
export * from "./user";

type BuiltinsOutputEntry = OutputTextEntry | BaseEntrySchema<"user">;

type BuiltinsInputEntry = InputTextEntry | BaseEntrySchema<"user">;

export type { BuiltinsOutputEntry, BuiltinsInputEntry };
