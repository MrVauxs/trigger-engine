import { IconObject } from "_zod";
import { BaseCombatantEvent } from ".";

class CreateCombatantEvent extends BaseCombatantEvent {
    static get type(): "create-combatant-event" {
        return "create-combatant-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf71d" };
    }
}

export { CreateCombatantEvent };
