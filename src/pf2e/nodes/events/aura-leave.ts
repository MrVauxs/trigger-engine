import { IconObject } from "_zod";
import { BaseAuraEvent } from "pf2e";

class AuraLeaveEvent extends BaseAuraEvent {
    static get type(): "aura-leave-event" {
        return "aura-leave-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf192" };
    }
}

export { AuraLeaveEvent };
