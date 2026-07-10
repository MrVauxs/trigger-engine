import { BaseConditionNode } from "engine";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class HasResourceConditionNode extends BaseConditionNode<Inputs, Outputs> {
    static get type(): "has-resource" {
        return "has-resource";
    }

    static get tags(): string[] {
        return ["resource"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "slug", type: "text" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [...BaseConditionNode.defineOutputs, { key: "value", type: "number" }, { key: "max", type: "number" }];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;
        const slug = await this.getInputValue("slug");
        const resource = actor?.getResource(slug);
        const hasResource = !!(resource && resource.max > 0);

        this.setOutputValue("value", hasResource ? resource.value : -1);
        this.setOutputValue("max", hasResource ? resource.max : -1);

        return this.executeIf(hasResource);
    }
}

type Inputs = {
    slug: string;
    target?: TargetDocuments;
};

type Outputs = {
    boolean: boolean;
    max: number;
    value: number;
};

export { HasResourceConditionNode };
