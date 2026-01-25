import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { getResourceData, ResourceInputs, resourceSchemas } from ".";

class DecreaseResourceActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "decrease-resource" {
        return "decrease-resource";
    }

    static get tags(): string[] {
        return ["resource"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            ...resourceSchemas(),
            {
                key: "min",
                type: "number",
                field: { min: 0 },
            },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\ue0b1" };
    }

    async _execute(): Promise<boolean> {
        const data = await getResourceData.call(this);

        if (data?.value) {
            const { actor, resource, value } = data;
            const min = await this.getInputValue("min");
            const newValue = Math.max(resource.value - value, min, 0);

            if (newValue !== resource.value && actor.isOfType("creature")) {
                await actor.updateResource(resource.slug, newValue);
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = ResourceInputs & {
    min: number;
};

export { DecreaseResourceActionNode };
