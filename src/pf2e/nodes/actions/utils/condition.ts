import { TriggerNode } from "engine";
import { ActorPF2e, ConditionKey, ConditionPF2e, ConditionSlug, R, recordToSelectOptions } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

let CONDITIONS: ConditionOptions | undefined;
let VALUED_CONDITIONS: ConditionOptions | undefined;

function getConditionOptions(): ConditionOptions {
    return (CONDITIONS ??= recordToSelectOptions(
        R.omit(CONFIG.PF2E.conditionTypes, ["persistent-damage"]),
    ) as ConditionOptions);
}

function getValuedConditions(): ConditionOptions {
    return (VALUED_CONDITIONS ??= R.filter(getConditionOptions(), ({ value }) => {
        const condition = game.pf2e.ConditionManager.conditions.get(value);
        return !!condition?.system.value.isValued;
    }));
}

function valuedConditionsSchemas(): PF2eInputEntry[] {
    return [
        { key: "target", type: "target" },
        {
            key: "condition",
            type: "text",
            field: {
                type: "select",
                options: getValuedConditions(),
                tooltip: false,
            },
        },
        {
            key: "value",
            type: "number",
            field: {
                default: 1,
                min: 0,
            },
        },
    ];
}

async function getValuedConditionsData(
    this: TriggerNode<any, ValuedConditionsInputs>,
): Promise<ValuedConditionsData | undefined> {
    const actor = (await this.getInputValue("target"))?.actor;
    if (!actor) return;

    const slug = await this.getInputValue("condition");
    const condition = actor.getCondition(slug);
    if (!condition) return;

    return {
        actor,
        condition,
        slug,
        value: await this.getInputValue("value"),
    };
}

type ConditionOptions = { value: ConditionType; label: string }[];

type ConditionType = Exclude<ConditionKey, `persistent-damage-${string}`>;

type ValuedConditionsInputs = {
    condition: ConditionSlug;
    target?: TargetDocuments;
    value: number;
};

type ValuedConditionsData = {
    actor: ActorPF2e;
    condition: ConditionPF2e<ActorPF2e>;
    slug: ConditionSlug;
    value: number;
};

export { getConditionOptions, getValuedConditions, getValuedConditionsData, valuedConditionsSchemas };
export type { ValuedConditionsInputs };
