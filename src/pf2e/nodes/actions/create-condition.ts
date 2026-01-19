import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { ConditionSlug, createCustomCondition } from "module-helpers";
import { PF2eInputEntry } from "pf2e";
import { DurationState, EffectInputs, durationStates, effectSchemas, getConditionOptions, getEffectData } from ".";

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
        return [
            { key: "target", type: "target" },
            {
                key: "condition",
                type: "text",
                field: {
                    type: "select",
                    options: getConditionOptions(),
                    tooltip: false,
                },
            },
            {
                key: "counter",
                type: "number",
                field: {
                    default: 1,
                    min: 1,
                },
            },
            ...effectSchemas(),
        ];
    }

    get icon(): IconObject {
        return { unicode: "\ue54d", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const condition = await this.getInputValue("condition");
        const counter = await this.getInputValue("counter");
        const effect = await getEffectData.call(this);
        const source = createCustomCondition({ ...effect, counter, slug: condition });

        if (source) {
            await actor.createEmbeddedDocuments("Item", [source]);
        }

        return this.executeNext("out");
    }
}

type Inputs = EffectInputs & {
    condition: ConditionSlug;
    counter: number;
    target?: TargetDocuments;
};

export { CreateConditionActionNode };
