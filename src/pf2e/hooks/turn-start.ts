import { BaseSingleHook } from "engine";
import { CombatantPF2e } from "module-helpers";

class TurnStartHook extends BaseSingleHook<TurnStartOptions> {
    static get type(): "turn-start-hook" {
        return "turn-start-hook";
    }

    get events(): ["turn-start-event"] {
        return ["turn-start-event"];
    }

    get eventName(): string {
        return "pf2e.startTurn";
    }

    _onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent("turn-start-event", {
                combatant: { actor, token: combatant.token },
                round: combatant.encounter?.round ?? 0,
            });
        }
    }
}

type TurnStartOptions = {
    combatant: TargetDocuments;
    round: number;
};

export { TurnStartHook };
export type { TurnStartOptions };
