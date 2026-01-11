import { BaseBuiltinsHook } from "engine";
import { CombatantPF2e, createToggleableHook } from "module-helpers";
import { TurnStartOptions } from "pf2e";

class TurnStartHook extends BaseBuiltinsHook<TurnStartOptions> {
    #hook = createToggleableHook("pf2e.startTurn", this.#onEvent.bind(this));

    static get type(): "turn-start-hook" {
        return "turn-start-hook";
    }

    get events(): ["turn-start-event"] {
        return ["turn-start-event"];
    }

    get eventName(): string {
        return "pf2e.startTurn";
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
            this.executeEvent(game.userId, "turn-start-event", {
                combatant: { actor, token: combatant.token },
                round: combatant.encounter?.round ?? 0,
            });
        }
    }
}

export { TurnStartHook };
