import { BaseTokenHook } from "engine";

class DeleteTokenHook extends BaseTokenHook {
    static get type(): "delete-token-hook" {
        return "delete-token-hook";
    }

    get events(): ["delete-token-event"] {
        return ["delete-token-event"];
    }

    get eventName(): string {
        return "deleteToken";
    }
}

export { DeleteTokenHook };
