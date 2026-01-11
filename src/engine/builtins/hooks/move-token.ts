import { BaseTokenHook } from "engine";

class MoveTokenHook extends BaseTokenHook {
    static get type(): "move-token-hook" {
        return "move-token-hook";
    }

    get events(): ["move-token-event"] {
        return ["move-token-event"];
    }

    get eventName(): string {
        return "moveToken";
    }
}

export { MoveTokenHook };
