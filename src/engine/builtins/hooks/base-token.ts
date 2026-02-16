import { TokenDocumentPF2e } from "foundry-helpers";
import { BaseSingleHook } from ".";

abstract class BaseTokenHook extends BaseSingleHook<TargetDocuments> {
    _onEvent(token: TokenDocumentPF2e): void {
        const actor = token.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(this.events[0], { actor, token });
        }
    }
}

export { BaseTokenHook };
