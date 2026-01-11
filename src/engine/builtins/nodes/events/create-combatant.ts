import { BaseCombatantEvent } from ".";

class CreateCombatantEvent extends BaseCombatantEvent {
    static get type(): "create-combatant-event" {
        return "create-combatant-event";
    }

    get icon(): string {
        return "\uf71d";
    }
}

export { CreateCombatantEvent };
