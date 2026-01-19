import {
    CreateCombatantEvent,
    CreateTokenEvent,
    DeleteCombatantEvent,
    DeleteTokenEvent,
    ExecuteEvent,
    MoveTokenEvent,
    RegionEvent,
    TestEvent,
} from ".";

export * from "./base";
export * from "./base-combatant";
export * from "./base-token";
export * from "./create-combatant";
export * from "./create-token";
export * from "./delete-combatant";
export * from "./delete-token";
export * from "./execute-event";
export * from "./move-token";
export * from "./region-event";
export * from "./start-event";
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
