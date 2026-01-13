import { IconObject } from "_zod";
import { BaseTokenEvent } from "engine";

class MoveTokenEvent extends BaseTokenEvent {
    static get type(): "move-token-event" {
        return "move-token-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf554" };
    }
}

export { MoveTokenEvent };
