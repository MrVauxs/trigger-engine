import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { createCustomCondition } from "module-helpers";
import { PF2eInputEntry } from "pf2e";
import {
    ConditionsInputs,
    DurationState,
    EffectInputs,
    conditionsSchemas,
    createEmbeddedItem,
    durationStates,
    effectSchemas,
    getConditionsData,
    getEffectData,
} from ".";

class CreateConditionActionNode extends BaseActionNode<"out", Inputs, never, never, never, DurationState> {
    static get type(): "create-condition" {
        return "create-condition";
    }

    static get tags(): string[] {
        return ["condition", "duration", "effect", "item"];
    }

    static get states(): string[] {
        return [...durationStates];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [...conditionsSchemas(), ...effectSchemas("effect")];
    }

    get icon(): IconObject {
        return { unicode: "\ue54d", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const data = await getConditionsData.call(this);

        if (data?.value) {
            const { actor, slug, value } = data;
            const effect = await getEffectData.call(this);
            const source = createCustomCondition({ ...effect, counter: value, slug });

            if (source) {
                await createEmbeddedItem(actor, source);
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = EffectInputs & ConditionsInputs;

export { CreateConditionActionNode };
