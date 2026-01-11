import { BaseCombatantHook } from ".";

class CreateCombatantHook extends BaseCombatantHook {
    static get type(): "create-combatant-hook" {
        return "create-combatant-hook";
    }

    get events(): ["create-combatant-event"] {
        return ["create-combatant-event"];
    }

    get eventName(): string {
        return "createCombatant";
    }
}

export { CreateCombatantHook };
