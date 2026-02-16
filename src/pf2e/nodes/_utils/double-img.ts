import { TriggerNode } from "engine";
import { localize, R, SYSTEM } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";

function doubleImgSchemas(state?: string): PF2eInputEntry[] {
    return R.map(["pf2e", "sf2e"] as const, (id): PF2eInputEntry => {
        return { key: `${id}Img`, type: "text", state, label: localize.path("pf2e-trigger.shared.image", id, "title") };
    });
}

function getDoubleImgValue(this: TriggerNode<any, DoubleImgInputs>): Promise<string> {
    return this.getInputValue(`${SYSTEM.id}Img`);
}

type DoubleImgInputs = {
    pf2eImg: string;
    sf2eImg: string;
};

export { doubleImgSchemas, getDoubleImgValue };
export type { DoubleImgInputs };
