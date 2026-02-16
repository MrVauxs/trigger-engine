import { BaseConditionNode } from "engine";
import { ActorPF2e, R } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";

class HasOptionConditionNode extends BaseConditionNode<Inputs> {
    static get type(): "has-option" {
        return "has-option";
    }

    static get tags(): string[] {
        return ["option"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "option", type: "text" },
        ];
    }

    async _execute(): Promise<boolean> {
        const option = await this.getInputValue("option");
        const target = (await this.getInputValue("target"))?.actor;
        const result = !!target && !!option && hasRollOption(target, option);

        return this.executeNextIf(result);
    }
}

function hasRollOption(actor: ActorPF2e, option: string) {
    const rolloptionsDomains = R.values(actor.rollOptions) as Record<string, boolean>[];
    return rolloptionsDomains.some((rollOptions) => rollOptions[option]);
}

type Inputs = {
    option: string;
    target?: TargetDocuments;
};

export { HasOptionConditionNode };
