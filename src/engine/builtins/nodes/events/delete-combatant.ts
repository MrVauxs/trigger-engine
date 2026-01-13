import { IconObject } from "_zod";
import { BaseCombatantEvent } from ".";

class DeleteCombatantEvent extends BaseCombatantEvent {
    static get type(): "delete-combatant-event" {
        return "delete-combatant-event";
    }

    get icon(): IconObject {
        return { unicode: "\ue433" };
    }
}

export { DeleteCombatantEvent };
