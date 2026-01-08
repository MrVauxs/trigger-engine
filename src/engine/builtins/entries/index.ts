import { InputTextEntry, OutputTextEntry } from ".";

export * from "./base";
export * from "./boolean";
export * from "./fields";
export * from "./number";
export * from "./target";
export * from "./text";

type BuiltinsOutputEntry = OutputTextEntry;

type BuiltinsInputEntry = InputTextEntry;

export type { BuiltinsOutputEntry, BuiltinsInputEntry };
