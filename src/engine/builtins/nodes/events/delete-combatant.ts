import { BaseCombatantEvent } from ".";

class DeleteCombatantEvent extends BaseCombatantEvent {
    static get type(): "delete-combatant-event" {
        return "delete-combatant-event";
    }

    get icon(): string {
        return "\ue433";
    }
}

export { DeleteCombatantEvent };
