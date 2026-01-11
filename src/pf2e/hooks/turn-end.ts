import { BaseCombatantHook } from "engine";

class TurnEndHook extends BaseCombatantHook {
    static get type(): "turn-end-hook" {
        return "turn-end-hook";
    }

    get events(): ["turn-end-event"] {
        return ["turn-end-event"];
    }

    get eventName(): string {
        return "pf2e.endTurn";
    }
}

export { TurnEndHook };
