import { CombatantPF2e } from "module-helpers";
import { BaseSingleHook } from ".";

class CreateCombatantHook extends BaseSingleHook<TargetDocuments> {
    static get type(): "create-combatant-hook" {
        return "create-combatant-hook";
    }

    get events(): ["create-combatant-event"] {
        return ["create-combatant-event"];
    }

    get eventName(): string {
        return "createCombatant";
    }

    _onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(game.userId, "create-combatant-event", { actor, token: combatant.token });
        }
    }
}

export { CreateCombatantHook };
