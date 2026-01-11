import { BaseEventNode } from "engine";
import { PF2eOutputEntry } from "pf2e";

class TokenMovedEvent extends BaseEventNode<never, { target: TargetDocuments }> {
    static get type(): "token-moved-event" {
        return "token-moved-event";
    }

    static get tags(): string[] {
        return ["token"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    get icon(): string {
        return "\uf554";
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("target", target);
        return this.executeNext("out");
    }
}

export { TokenMovedEvent };
