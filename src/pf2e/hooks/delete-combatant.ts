import { CombatantPF2e } from "module-helpers";
import { BaseSingleHook } from ".";

class DeleteCombatantHook extends BaseSingleHook<TargetDocuments> {
    static get type(): "delete-combatant-hook" {
        return "delete-combatant-hook";
    }

    get events(): ["delete-combatant-event"] {
        return ["delete-combatant-event"];
    }

    get eventName(): string {
        return "deleteCombatant";
    }

    _onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(game.userId, "delete-combatant-event", { actor, token: combatant.token });
        }
    }
}

export { DeleteCombatantHook };
