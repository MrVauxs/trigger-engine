import { TokenDocumentPF2e } from "module-helpers";
import { BaseSingleHook } from ".";

class TokenMovedHook extends BaseSingleHook<Required<TargetDocuments>> {
    static get type(): "token-moved-hook" {
        return "token-moved-hook";
    }

    get events(): ["token-moved-event"] {
        return ["token-moved-event"];
    }

    get eventName(): string {
        return "moveToken";
    }

    _onEvent(token: TokenDocumentPF2e, _data: Record<string, any>): void {
        const actor = token.actor;

        if (this.isValidActor(actor)) {
            this.executeEvent(game.userId, "token-moved-event", { actor, token });
        }
    }
}

export { TokenMovedHook };
