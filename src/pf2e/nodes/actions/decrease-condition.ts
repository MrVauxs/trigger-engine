import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { ValuedConditionsInputs, getValuedConditionsData, valuedConditionsSchemas } from ".";

class DecreaseConditionActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "decrease-condition" {
        return "decrease-condition";
    }

    static get tags(): string[] {
        return ["condition"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            ...valuedConditionsSchemas(),
            {
                key: "min",
                type: "number",
                field: { min: 0 },
            },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf503", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const data = await getValuedConditionsData.call(this);
        const condition = data && data.actor.getCondition(data.slug);

        if (condition) {
            const min = await this.getInputValue("min");
            const currentValue = condition._source.system.value.value ?? 0;
            const newValue = Math.max(currentValue - data.value, min);

            if (newValue !== currentValue) {
                await game.pf2e.ConditionManager.updateConditionValue(condition.id, data.actor, newValue);
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = ValuedConditionsInputs & {
    min: number;
};

export { DecreaseConditionActionNode };
