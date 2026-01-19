import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { ValuedConditionsInputs, durationStates, getValuedConditionsData, getValuedConditionsSchemas } from ".";

class DecreaseConditionActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "decrease-condition" {
        return "decrease-condition";
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
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const { slug, value } = await getValuedConditionsData.call(this);
        const condition = actor.getCondition(slug);

        if (!condition) {
            return this.executeNext("out");
        }

        const min = await this.getInputValue("min");
        const currentValue = condition._source.system.value.value ?? 0;
        const newValue = Math.max(currentValue - value, min);

        if (newValue !== currentValue) {
            await game.pf2e.ConditionManager.updateConditionValue(condition.id, actor, newValue);
        }

        return this.executeNext("out");
    }
}

type Inputs = ValuedConditionsInputs & {
    min: number;
};

export { DecreaseConditionActionNode };
