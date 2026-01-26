import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";

class UpdateResourceActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "update-resource" {
        return "update-resource";
    }

    static get tags(): string[] {
        return ["resource"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "resource", type: "text" },
            {
                key: "value",
                type: "number",
                field: { default: 1 },
            },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf241" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;
        const slug = await this.getInputValue("resource");
        const resource = actor?.getResource(slug);

        if (resource) {
            const value = await this.getInputValue("value");
            const newValue = Math.clamp(resource.value + value, 0, resource.max);

            if (newValue !== resource.value && actor?.isOfType("creature")) {
                await actor.updateResource(resource.slug, newValue);
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    target?: TargetDocuments;
    resource: string;
    value: number;
};

export { UpdateResourceActionNode };
