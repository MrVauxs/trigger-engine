import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { ValuedConditionsInputs, durationStates, getValuedConditionsData, getValuedConditionsSchemas } from ".";

class InceaseConditionActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "increase-condition" {
        return "increase-condition";
    }

    static get tags(): string[] {
        return ["condition"];
    }

    static get states(): string[] {
        return [...durationStates];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            ...getValuedConditionsSchemas(),
            {
                key: "max",
                type: "number",
                field: { min: 0 },
            },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf234", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const { slug, value } = await getValuedConditionsData.call(this);
        const max = (await this.getInputValue("max")) || undefined;

        await actor.increaseCondition(slug, { max, value });

        return this.executeNext("out");
    }
}

type Inputs = ValuedConditionsInputs & {
    max: number;
};

export { InceaseConditionActionNode };
