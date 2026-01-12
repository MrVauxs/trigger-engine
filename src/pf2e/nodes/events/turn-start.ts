import { BaseEventNode } from "engine";
import { PF2eOutputEntry, TurnStartOptions } from "pf2e";

class TurnStartEvent extends BaseEventNode<never, TurnStartOptions> {
    static get type(): "turn-start-event" {
        return "turn-start-event";
    }

    static get tags(): string[] {
        return ["combat", "combatant", "turn"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [
            { key: "combatant", type: "target" },
            { key: "round", type: "number" },
        ];
    }

    get icon(): string {
        return "\uf251";
    }

    async _execute({ round, combatant }: TurnStartOptions): Promise<boolean> {
        this.setOutputValue("combatant", combatant);
        this.setOutputValue("round", round);
        return this.executeNext("out");
    }
}

export { TurnStartEvent };
