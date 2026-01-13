import { IconObject } from "_zod";
import { BaseTokenEvent } from "engine";

class DeleteTokenEvent extends BaseTokenEvent {
    static get type(): "delete-token-event" {
        return "delete-token-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf2bd" };
    }
}

export { DeleteTokenEvent };
