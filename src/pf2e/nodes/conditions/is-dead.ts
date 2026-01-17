import { BaseConditionNode } from "engine";
import { PF2eInputEntry } from "pf2e";

class IsDeadConditionNode extends BaseConditionNode<{ target?: TargetDocuments }> {
    static get type(): "is-dead" {
        return "is-dead";
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;
        return this.executeNextIf(actor?.isDead);
    }
}

export { IsDeadConditionNode };
