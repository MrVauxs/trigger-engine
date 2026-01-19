import { DeleteCombatantEvent } from ".";
import { ExecuteEvent } from ".";
import { RegionEvent } from ".";
import { TestEvent } from ".";
import { MoveTokenEvent } from ".";
import { DeleteTokenEvent } from ".";
import { CreateTokenEvent } from ".";
import { CreateCombatantEvent } from ".";

export * from "./base";
export * from "./base-combatant";
export * from "./base-token";
export * from "./create-combatant";
export * from "./create-token";
export * from "./delete-combatant";
export * from "./delete-token";
export * from "./execute-event";
export * from "./move-token";
export * from "./start-event";
export * from "./region-event";
export * from "./test-event";

export default [
    CreateCombatantEvent,
    CreateTokenEvent,
    DeleteCombatantEvent,
    DeleteTokenEvent,
    ExecuteEvent,
    MoveTokenEvent,
    RegionEvent,
    TestEvent,
] as const;
