import { IconObject } from "_zod";
import { BaseAuraEvent } from "pf2e";

class AuraEnterEvent extends BaseAuraEvent {
    static get type(): "aura-enter-event" {
        return "aura-enter-event";
    }

    get icon(): IconObject {
        return { unicode: "\uf192", fontWeight: "900" };
    }
}

export { AuraEnterEvent };
