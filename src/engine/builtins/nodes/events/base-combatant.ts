import { BaseEventNode, SpecialIcon, gmOnlySpecialIcon } from "engine";
import { PF2eOutputEntry } from "pf2e";

abstract class BaseCombatantEvent extends BaseEventNode<never, { combatant: TargetDocuments }> {
    static get tags(): string[] {
        return ["combat", "combatant"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "combatant", type: "target" }];
    }

    get specialIcons(): SpecialIcon[] {
        return [gmOnlySpecialIcon];
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("combatant", target);
        return this.executeNext("out");
    }
}

export { BaseCombatantEvent };
