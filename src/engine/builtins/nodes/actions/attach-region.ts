import { IconObject } from "_zod";
import { BaseActionNode, BuiltinsInputEntry, moveRegionToPosition } from "engine";
import { getTargetToken, RegionSource } from "foundry-helpers";

class AttachRegionActionNode extends BaseActionNode<"out", Inputs, never, never, never, State> {
    static get type(): "attach-region" {
        return "attach-region";
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get states(): string[] {
        return ["attach", "detach"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "region", type: "any" },
            { key: "target", type: "target", state: "attach" },
            { key: "token", type: "target", state: "detach" },
            { key: "center", type: "boolean", state: "attach" },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf3c5", fontWeight: "900" };
    }

    get title(): string {
        return this.localize(this.state === "detach" ? "detach" : "title") as string;
    }

    async _execute(): Promise<boolean> {
        const region = await this.getInputValue("region");

        if (!(region instanceof RegionDocument)) {
            return this.executeNext("out");
        }

        const target = await this.getInputValue("target");
        const token = getTargetToken(target, { scene: region.object.scene });

        // we detach
        if (this.state === "detach") {
            const current = region.attachment.token?.id;

            if (current && (!target || current === token?.id)) {
                await region.update({ attachment: { token: null } });
            }

            return this.executeNext("out");
        }

        if (!token?.object) {
            return this.executeNext("out");
        }

        const center = await this.getInputValue("center");
        const updates: DeepPartial<RegionSource> = {
            attachment: { token: token.id },
        };

        if (center) {
            updates.shapes = moveRegionToPosition(region, token);
        }

        await region.update(updates);

        return this.executeNext("out");
    }
}

type Inputs = {
    center: boolean;
    region?: any;
    target?: TargetDocuments;
};

type State = "attach" | "detach";

export { AttachRegionActionNode };
