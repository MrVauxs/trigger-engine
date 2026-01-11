import { BaseEventNode } from "engine";
import { PF2eOutputEntry } from "pf2e";

class TurnEventNode extends BaseEventNode<never, { target: TargetDocuments }> {
    static get tags(): string[] {
        return ["combat", "combatant", "turn"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("target", target);
        return this.executeNext("out");
    }
}

class TurnEndEventNode extends TurnEventNode {
    static get type(): "turn-end-event" {
        return "turn-end-event";
    }

    get icon(): string {
        return "\uf253";
    }
}

class TurnStartEventNode extends TurnEventNode {
    static get type(): "turn-start-event" {
        return "turn-start-event";
    }

    get icon(): string {
        return "\uf251";
    }
}

export { TurnEndEventNode, TurnStartEventNode };
