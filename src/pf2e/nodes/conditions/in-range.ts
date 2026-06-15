import { BaseConditionNode } from "engine";
import { distanceBetween, TokenDocumentPF2e } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";

class InRangeConditionNode extends BaseConditionNode<Inputs> {
    static get type(): "in-range" {
        return "in-range";
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "origin", type: "target" },
            {
                key: "distance",
                type: "number",
                field: {
                    default: 5,
                    min: 5,
                    step: 5,
                },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        const scene = this.sceneContext;
        const origin = await this.getInputValue("origin");
        const target = await this.getInputValue("target");
        const originToken = this.getTargetToken<TokenDocumentPF2e>(origin, { scene })?.object;
        const targetToken = this.getTargetToken<TokenDocumentPF2e>(target, { scene })?.object;

        if (!originToken || !targetToken) {
            return this.execute("false");
        }

        const distance = await this.getInputValue("distance");
        const inRange = distanceBetween(originToken, targetToken) <= distance;

        return this.executeIf(!!inRange);
    }
}

type Inputs = {
    distance: number;
    origin?: TargetDocuments;
    target?: TargetDocuments;
};

export { InRangeConditionNode };
