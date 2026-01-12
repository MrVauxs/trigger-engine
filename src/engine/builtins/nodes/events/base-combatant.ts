import { BaseEventNode, BuiltinsOutputEntry } from "engine";

abstract class BaseCombatantEvent extends BaseEventNode<never, { combatant: TargetDocuments }> {
    static get tags(): string[] {
        return ["combat", "combatant"];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [{ key: "combatant", type: "target" }];
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("combatant", target);
        return this.executeNext("out");
    }
}

export { BaseCombatantEvent };
