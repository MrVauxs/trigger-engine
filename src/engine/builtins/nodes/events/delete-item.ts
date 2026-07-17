import { IconObject } from "_zod";
import { BaseItemEvent } from ".";

class DeleteItemEvent extends BaseItemEvent {
    static get type(): "delete-item-event" {
        return "delete-item-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf0f2" };
    }
}

export { DeleteItemEvent };
