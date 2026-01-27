import { BaseConditionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { ConditionsInputs, conditionsSchemas, getConditionsData } from "..";

class HasConditionConditionNode extends BaseConditionNode<Inputs> {
    static get type(): "has-condition" {
        return "has-condition";
    }

    static get tags(): string[] {
        return ["item", "effect", "condition"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return conditionsSchemas();
    }

    async _execute(): Promise<boolean> {
        const data = await getConditionsData.call(this);

        if (!data) {
            return this.executeNext("false");
        }

        const { actor, slug, value } = data;
        const conditions = actor.conditions.bySlug(slug);
        const hasCondition =
            conditions.length > 0 &&
            (value <= 1 ||
                !conditions[0].system.value.isValued ||
                conditions.some((condition) => (condition.value ?? 1) >= value));

        return this.executeNextIf(hasCondition);
    }
}

type Inputs = ConditionsInputs;

export { HasConditionConditionNode };
