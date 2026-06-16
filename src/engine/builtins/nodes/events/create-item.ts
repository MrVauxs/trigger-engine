import { IconObject } from "_zod";
import { BaseItemEvent } from ".";

class CreateItemEvent extends BaseItemEvent {
    static get type(): "create-item-event" {
        return "create-item-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf0f2", fontWeight: "900" };
    }
}

export { CreateItemEvent };
