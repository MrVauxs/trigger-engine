import { BaseEventNode } from "engine";
import { PF2eOutputEntry } from "pf2e";

class TurnEndEvent extends BaseEventNode<never, { combatant: TargetDocuments }> {
    static get type(): "turn-end-event" {
        return "turn-end-event";
    }

    static get tags(): string[] {
        return ["combat", "combatant", "turn"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "combatant", type: "target" }];
    }

    get icon(): string {
        return "\uf253";
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("combatant", target);
        return this.executeNext("out");
    }
}

export { TurnEndEvent };
