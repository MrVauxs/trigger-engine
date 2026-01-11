import { BaseTokenEvent } from "engine";

class MoveTokenEvent extends BaseTokenEvent {
    static get type(): "move-token-event" {
        return "move-token-event";
    }

    get icon(): string {
        return "\uf554";
    }
}

export { MoveTokenEvent };
