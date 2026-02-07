import { TriggerNode } from "engine";
import actions from "./actions";
import conditions from "./conditions";
import events from "./events";
import extractors from "./extractors";
import logics from "./logics";
import splitters from "./splitters";
import values from "./values";

export * from "./_utils";
export * from "./actions";
export * from "./conditions";
export * from "./events";
export * from "./extractors";
export * from "./logics";
export * from "./splitters";
export * from "./values";

export default [
    ...actions,
    ...conditions,
    ...events,
    ...extractors,
    ...logics,
    ...splitters,
    ...values,
] as (typeof TriggerNode)[];
