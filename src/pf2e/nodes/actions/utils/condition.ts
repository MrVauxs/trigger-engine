import { R, recordToSelectOptions } from "module-helpers";

let CONDITIONS: SelectOptions | undefined;

function getConditionOptions(): SelectOptions {
    return (CONDITIONS ??= recordToSelectOptions(R.omit(CONFIG.PF2E.conditionTypes, ["persistent-damage"])));
}

export { getConditionOptions };
