import { DeleteCombatantHook } from ".";
import { ExecuteHook } from ".";
import { RegionHook } from ".";
import { TestHook } from ".";
import { MoveTokenHook } from ".";
import { DeleteTokenHook } from ".";
import { CreateTokenHook } from ".";
import { CreateCombatantHook } from ".";

export * from "./base-single-hook";
export * from "./base-combatant";
export * from "./base-token";
export * from "./create-combatant";
export * from "./create-token";
export * from "./delete-combatant";
export * from "./delete-token";
export * from "./execute-hook";
export * from "./move-token";
export * from "./region-hook";
export * from "./test-hook";

export default [
    CreateCombatantHook,
    CreateTokenHook,
    DeleteCombatantHook,
    DeleteTokenHook,
    ExecuteHook,
    MoveTokenHook,
    RegionHook,
    TestHook,
] as const;
