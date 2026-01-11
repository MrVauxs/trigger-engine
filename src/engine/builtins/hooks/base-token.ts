import { TokenDocumentPF2e } from "module-helpers";
import { BaseSingleHook } from ".";

abstract class BaseTokenHook extends BaseSingleHook<TargetDocuments> {
    _onEvent(token: TokenDocumentPF2e): void {
        const actor = token.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(game.userId, this.events[0], { actor, token });
        }
    }
}

export { BaseTokenHook };
