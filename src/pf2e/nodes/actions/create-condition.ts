import { IconObject } from "_zod";
import { BaseActionNode, CustomInputSchema } from "engine";
import { ConditionSlug, createCustomCondition } from "module-helpers";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";
import { DurationState, EffectInputs, durationStates, effectSchemas, getConditionOptions, getEffectData } from ".";

class CreateConditionActionNode extends BaseActionNode<"out", Inputs, never, never, never, DurationState> {
    static get type(): "create-condition" {
        return "create-condition";
    }

    static get tags(): string[] {
        return ["condition", "effect", "item"];
    }

    static get states(): string[] {
        return [...durationStates];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            {
                key: "slug",
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

    static get defineOutputs(): PF2eOutputEntry[] {
        return [];
    }

    static get defineCustomInputs(): CustomInputSchema[] {
        return [];
    }

    get icon(): IconObject {
        return { unicode: "\ue54d", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const slug = await this.getInputValue("slug");
        const counter = await this.getInputValue("counter");
        const effect = await getEffectData.call(this);
        const source = createCustomCondition({ ...effect, counter, slug });

        if (source) {
            await actor.createEmbeddedDocuments("Item", [source]);
        }

        return this.executeNext("out");
    }
}

type Inputs = EffectInputs & {
    counter: number;
    slug: ConditionSlug;
    target?: TargetDocuments;
};

export { CreateConditionActionNode };
