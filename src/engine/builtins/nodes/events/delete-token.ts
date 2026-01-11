import { BaseTokenEvent } from "engine";

class DeleteTokenEvent extends BaseTokenEvent {
    static get type(): "delete-token-event" {
        return "delete-token-event";
    }

    get icon(): string {
        return "\uf2bd";
    }
}

export { DeleteTokenEvent };
