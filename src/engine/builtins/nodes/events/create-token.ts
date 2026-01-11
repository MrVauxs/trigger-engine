import { IconObject } from "_zod";
import { BaseTokenEvent } from "engine";

class CreateTokenEvent extends BaseTokenEvent {
    static get type(): "create-token-event" {
        return "create-token-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf2bd", fontWeight: "900" };
    }
}

export { CreateTokenEvent };
