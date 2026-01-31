import { IconObject } from "_zod";
import { BaseEventNode } from "engine";
import { AttackRollOptions, PF2eOutputEntry } from "pf2e";

class AttackRollEvent extends BaseEventNode<never, Outputs> {
    static get type(): "attack-roll-event" {
        return "attack-roll-event";
    }

    static get tags(): string[] {
        return ["chat", "attack", "check"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [
            { key: "origin", type: "target" },
            { key: "target", type: "target" },
            { key: "item", type: "item" },
            { key: "outcome", type: "outcome" },
            { key: "action", type: "text" },
            { key: "options", type: "text", isArray: true },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf71c" };
    }

    async _execute({ action, item, options, origin, outcome, target }: AttackRollOptions): Promise<boolean> {
        this.setOutputValue("action", action);
        this.setOutputValue("item", item);
        this.setOutputValue("options", options);
        this.setOutputValue("origin", origin);
        this.setOutputValue("outcome", outcome);
        this.setOutputValue("target", target);

        return this.executeNext("out");
    }
}

type Outputs = AttackRollOptions;

export { AttackRollEvent };
