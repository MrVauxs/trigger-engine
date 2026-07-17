import {
    CreateCombatantEvent,
    CreateItemEvent,
    CreateTokenEvent,
    DeleteCombatantEvent,
    DeleteItemEvent,
    DeleteTokenEvent,
    ExecuteEvent,
    HookCalledEvent,
    MoveTokenEvent,
    RegionEvent,
    TestEvent,
} from ".";

export * from "./base";
export * from "./base-combatant";
export * from "./base-item";
export * from "./base-token";
export * from "./create-combatant";
export * from "./create-item";
export * from "./create-token";
export * from "./delete-combatant";
export * from "./delete-item";
export * from "./delete-token";
export * from "./execute-event";
export * from "./hook-called";
export * from "./move-token";
export * from "./region-event";
export * from "./start-event";
export * from "./test-event";

export default [
    CreateCombatantEvent,
    CreateItemEvent,
    CreateTokenEvent,
    DeleteCombatantEvent,
    DeleteItemEvent,
    DeleteTokenEvent,
    ExecuteEvent,
    HookCalledEvent,
    MoveTokenEvent,
    RegionEvent,
    TestEvent,
] as const;
