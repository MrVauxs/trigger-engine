import { BaseConditionNode } from "engine";
import { isInCombat } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";

class InCombatConditionNode extends BaseConditionNode<{ target?: TargetDocuments }> {
    static get type(): "in-combat" {
        return "in-combat";
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;
        const inCombat = actor && isInCombat(actor);
        return this.executeNextIf(inCombat);
    }
}

export { InCombatConditionNode };
