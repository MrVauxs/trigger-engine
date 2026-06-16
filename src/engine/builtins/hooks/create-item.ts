import { BaseItemHook } from "engine";

class CreateItemHook extends BaseItemHook {
    static get type(): "create-item" {
        return "create-item";
    }

    get events(): ["create-item-event"] {
        return ["create-item-event"];
    }

    get eventName(): string {
        return "createItem";
    }
}

export { CreateItemHook };
