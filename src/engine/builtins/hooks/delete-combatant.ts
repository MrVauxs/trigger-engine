import { BaseCombatantHook } from ".";

class DeleteCombatantHook extends BaseCombatantHook {
    static get type(): "delete-combatant-hook" {
        return "delete-combatant-hook";
    }

    get events(): ["delete-combatant-event"] {
        return ["delete-combatant-event"];
    }

    get eventName(): string {
        return "deleteCombatant";
    }
}

export { DeleteCombatantHook };
