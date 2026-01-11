import { BaseAuraEvent } from "pf2e";

class AuraLeaveEvent extends BaseAuraEvent {
    static get type(): "aura-leave-event" {
        return "aura-leave-event";
    }

    get icon(): string {
        return "\uf192";
    }
}

export { AuraLeaveEvent };
