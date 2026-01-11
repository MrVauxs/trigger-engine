import { BaseCombatantEvent } from "engine";

class TurnEndEvent extends BaseCombatantEvent {
    static get type(): "turn-end-event" {
        return "turn-end-event";
    }

    static get tags(): string[] {
        return [...super.tags, "turn"];
    }

    get icon(): string {
        return "\uf253";
    }
}

export { TurnEndEvent };
