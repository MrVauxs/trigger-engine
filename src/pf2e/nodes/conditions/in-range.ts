import { BaseConditionNode } from "engine";
import { distanceBetween, getTargetToken } from "module-helpers";
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
        const originToken = getTargetToken(origin, { scene })?.object;
        const targetToken = getTargetToken(target, { scene })?.object;

        if (!originToken || !targetToken) {
            return this.executeNext("false");
        }

        const distance = await this.getInputValue("distance");
        const inRange = distanceBetween(originToken, targetToken) <= distance;

        return this.executeNextIf(!!inRange);
    }
}

type Inputs = {
    distance: number;
    origin?: TargetDocuments;
    target?: TargetDocuments;
};

export { InRangeConditionNode };
