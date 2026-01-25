import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { ValuedConditionsInputs, getValuedConditionsData, valuedConditionsSchemas } from ".";

class InceaseConditionActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "increase-condition" {
        return "increase-condition";
    }

    static get tags(): string[] {
        return ["condition"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            ...valuedConditionsSchemas(),
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
        const data = await getValuedConditionsData.call(this);

        if (data?.value) {
            const max = (await this.getInputValue("max")) || undefined;
            await data.actor.increaseCondition(data.slug, { max, value: data.value });
        }

        return this.executeNext("out");
    }
}

type Inputs = ValuedConditionsInputs & {
    max: number;
};

export { InceaseConditionActionNode };
