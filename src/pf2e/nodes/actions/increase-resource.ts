import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { getResourceData, ResourceInputs, resourceSchemas } from ".";

class InceaseResourceActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "increase-resource" {
        return "increase-resource";
    }

    static get tags(): string[] {
        return ["resource"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            ...resourceSchemas(),
            {
                key: "max",
                type: "number",
                field: { min: 0 },
            },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf240" };
    }

    async _execute(): Promise<boolean> {
        const data = await getResourceData.call(this);

        if (data?.value) {
            const { actor, resource, value } = data;
            const max = (await this.getInputValue("max")) || Number.MAX_SAFE_INTEGER;
            const newValue = Math.min(resource.value + value, max, resource.max);

            if (newValue !== resource.value && actor.isOfType("creature")) {
                await actor.updateResource(resource.slug, newValue);
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = ResourceInputs & {
    max: number;
};

export { InceaseResourceActionNode };
