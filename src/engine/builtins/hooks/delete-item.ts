import { BaseItemHook } from "engine";

class DeleteItemHook extends BaseItemHook {
    static get type(): "delete-item" {
        return "delete-item";
    }

    get events(): ["delete-item-event"] {
        return ["delete-item-event"];
    }

    get eventName(): string {
        return "deleteItem";
    }
}

export { DeleteItemHook };
