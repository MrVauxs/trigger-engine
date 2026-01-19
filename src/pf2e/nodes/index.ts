import { TriggerNode } from "engine";
import actions from "./actions";
import conditions from "./conditions";
import events from "./events";
import logics from "./logics";
import splitters from "./splitters";
import values from "./values";

export * from "./actions";
export * from "./conditions";
export * from "./events";
export * from "./logics";
export * from "./splitters";
export * from "./values";

export default [...actions, ...conditions, ...events, ...logics, ...splitters, ...values] as (typeof TriggerNode)[];
