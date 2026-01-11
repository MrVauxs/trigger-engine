import { BaseBuiltinsHook } from "engine";
import { CombatantPF2e, createToggleableHook } from "module-helpers";

class TurnEndHook extends BaseBuiltinsHook<TargetDocuments> {
    #hook = createToggleableHook("pf2e.endTurn", this.#onEvent.bind(this));

    static get type(): "turn-end-hook" {
        return "turn-end-hook";
    }

    get events(): ["turn-end-event"] {
        return ["turn-end-event"];
    }

    get eventName(): string {
        return "pf2e.endTurn";
    }

    _enable(): void {
        if (game.user.isGM) {
            this.#hook.activate();
        }
    }

    _disable(): void {
        this.#hook.disable();
    }

    #onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (game.user.isActiveGM && this.isValidActor(actor)) {
            this.executeEvent(game.userId, "turn-end-event", { actor, token: combatant.token });
        }
    }
}

export { TurnEndHook };
