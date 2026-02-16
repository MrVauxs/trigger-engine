import { CombatantPF2e } from "foundry-helpers";
import { BaseSingleHook } from ".";

abstract class BaseCombatantHook extends BaseSingleHook<TargetDocuments> {
    _onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(this.events[0], { actor, token: combatant.token });
        }
    }
}

export { BaseCombatantHook };
