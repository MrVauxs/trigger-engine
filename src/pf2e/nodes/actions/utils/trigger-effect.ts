import { TriggerNode } from "engine";
import { joinStr } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

let SCHEMAS: PF2eInputEntry[] | undefined;

function triggerEffectSchemas(): PF2eInputEntry[] {
    return (SCHEMAS ??= [
        { key: "target", type: "target" },
        { key: "identifier", type: "text" },
    ]);
}

async function getTriggerEffectData(this: TriggerNode<any, TriggerEffectInputs>): Promise<TriggerEffectData> {
    const identifier = await this.getInputValue("identifier");
    return {
        identifier,
        slug: joinStr("-", this.triggerPath, identifier),
    };
}

type TriggerEffectData = {
    identifier: string;
    slug: string;
};

type TriggerEffectInputs = {
    identifier: string;
    target?: TargetDocuments;
};

export { getTriggerEffectData, triggerEffectSchemas };
export type { TriggerEffectInputs };
