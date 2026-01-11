import { CombatantPF2e } from "module-helpers";
import { BaseSingleHook } from ".";

class TurnEndHook extends BaseSingleHook<TargetDocuments> {
    static get type(): "turn-end-hook" {
        return "turn-end-hook";
    }

    get events(): ["turn-end-event"] {
        return ["turn-end-event"];
    }

    get eventName(): string {
        return "pf2e.endTurn";
    }

    _onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(game.userId, "turn-end-event", { actor, token: combatant.token });
        }
    }
}

export { TurnEndHook };
