import { CombatantPF2e } from "module-helpers";
import { BaseSingleHook } from ".";

abstract class BaseTurnHook extends BaseSingleHook<TargetDocuments> {
    onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(game.userId, this.eventType, { actor });
        }
    }
}

class TurnStartHook extends BaseTurnHook {
    static get type(): "turn-start-hook" {
        return "turn-start-hook";
    }

    get eventName(): string {
        return "pf2e.startTurn";
    }

    get eventType(): string {
        return "turn-start-event";
    }
}

class TurnEndHook extends BaseTurnHook {
    static get type(): "turn-end-hook" {
        return "turn-end-hook";
    }

    get eventName(): string {
        return "pf2e.endTurn";
    }

    get eventType(): string {
        return "turn-end-event";
    }
}

export { TurnEndHook, TurnStartHook };
