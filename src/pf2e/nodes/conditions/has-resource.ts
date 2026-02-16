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
        return [{ key: "value", type: "number" }];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;
        const slug = await this.getInputValue("slug");
        const resource = actor?.getResource(slug);
        const hasResource = !!(resource && resource.max > 0);

        this.setOutputValue("value", hasResource ? resource.value : -1);

        return this.executeNextIf(hasResource);
    }
}

type Inputs = {
    slug: string;
    target?: TargetDocuments;
};

type Outputs = {
    value: number;
};

export { HasResourceConditionNode };
