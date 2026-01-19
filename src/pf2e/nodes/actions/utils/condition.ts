import { TriggerNode } from "engine";
import { ConditionKey, ConditionSlug, R, recordToSelectOptions } from "module-helpers";
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

function getValuedConditionsSchemas(): PF2eInputEntry[] {
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
                min: 1,
            },
        },
    ];
}

async function getValuedConditionsData(this: TriggerNode<any, ValuedConditionsInputs>): Promise<ValuedConditionsData> {
    return {
        slug: await this.getInputValue("condition"),
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
    slug: ConditionSlug;
    value: number;
};

export { getConditionOptions, getValuedConditions, getValuedConditionsData, getValuedConditionsSchemas };
export type { ValuedConditionsInputs };
