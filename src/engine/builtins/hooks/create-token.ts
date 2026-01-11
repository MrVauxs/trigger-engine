import { BaseTokenHook } from "engine";

class CreateTokenHook extends BaseTokenHook {
    static get type(): "create-token-hook" {
        return "create-token-hook";
    }

    get events(): ["create-token-event"] {
        return ["create-token-event"];
    }

    get eventName(): string {
        return "createToken";
    }
}

export { CreateTokenHook };
