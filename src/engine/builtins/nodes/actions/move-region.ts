import { IconObject } from "_zod";
import { BaseActionNode, BuiltinsInputEntry, moveRegionToPosition } from "engine";
import { getTargetToken, RegionSource, ScenePF2e } from "foundry-helpers";

class MoveRegionActionNode extends BaseActionNode<"out", Inputs, never, never, never, State> {
    static get type(): "move-region" {
        return "move-region";
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get states(): string[] {
        return ["coord", "token"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "region", type: "any" },
            { key: "x", type: "number", state: "coord" },
            { key: "y", type: "number", state: "coord" },
            { key: "target", type: "target", state: "token" },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf61f", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const region = await this.getInputValue("region");

        if (!(region instanceof RegionDocument)) {
            return this.executeNext("out");
        }

        const pointOrToken = await this.#getPointOrToken(region);
        const shapes = pointOrToken && moveRegionToPosition(region, pointOrToken);

        if (shapes) {
            await region.update({ shapes } satisfies DeepPartial<RegionSource>);
        }

        return this.executeNext("out");
    }

    async #getPointOrToken(region: RegionDocument): Promise<TokenDocument | Point | undefined> {
        if (this.state === "token") {
            const target = await this.getInputValue("target");
            return getTargetToken(target, { scene: region.object.scene as ScenePF2e | null });
        }

        return {
            x: await this.getInputValue("x"),
            y: await this.getInputValue("y"),
        };
    }
}

type Inputs = {
    region?: any;
    target?: TargetDocuments;
    x: number;
    y: number;
};

type State = "coord" | "token";

export { MoveRegionActionNode };
