import { IconObject } from "_zod";
import { BaseItemEvent } from ".";

class DeleteItemEvent extends BaseItemEvent {
    static get type(): "delete-item-event" {
        return "delete-item-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf1f8", fontWeight: "900" };
    }
}

export { DeleteItemEvent };
