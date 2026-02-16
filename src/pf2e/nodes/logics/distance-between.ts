import { BaseLogicNode } from "engine";
import { distanceBetween, getTargetToken } from "foundry-helpers";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class DistanceBetweenLogicNode extends BaseLogicNode<"out", Inputs, { distance: number }> {
    static get type(): "distance-between" {
        return "distance-between";
    }

    static get tags(): string[] {
        return ["token"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "a", type: "target" },
            { key: "b", type: "target" },
            { key: "strict", type: "boolean" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "distance", type: "number" }];
    }

    get canBreak(): boolean {
        return true;
    }

    async _execute(): Promise<boolean> {
        const a = await this.getInputValue("a");
        const b = await this.getInputValue("b");
        const strict = await this.getInputValue("strict");

        const tokenA = a.token ?? a.actor.token;
        const tokenB = b.token ?? b.actor.token;

        if (strict && (!tokenA || !tokenB)) {
            return true;
        }

        const sceneContext = this.sceneContext;
        const activeTokenA = (tokenA ?? getTargetToken(a, { scene: sceneContext }))?.object;
        const activeTokenB = (tokenB ?? getTargetToken(b, { scene: sceneContext }))?.object;

        if (!activeTokenA || !activeTokenB) {
            return true;
        }

        const distance = distanceBetween(activeTokenA, activeTokenB);

        this.setOutputValue("distance", distance);
        return this.executeNext("out");
    }
}

type Inputs = {
    a: TargetDocuments;
    b: TargetDocuments;
    strict: boolean;
};

export { DistanceBetweenLogicNode };
