import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";
import { ItemPF2e, findItemWithSlug, findItemWithSourceId } from "module-helpers";
import { BaseConditionNode } from "engine";

class HasItemConditionNode extends BaseConditionNode<Inputs, Outputs, never, never, "uuid" | "slug"> {
    static get type(): "has-item" {
        return "has-item";
    }

    static get states(): string[] {
        return ["uuid", "slug"];
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "uuid", type: "text", state: "uuid" },
            { key: "slug", type: "text", state: "slug" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "item", type: "item" },
        ];
    }

    async _execute(): Promise<boolean> {
        const target = await this.getInputValue("target");

        if (!target?.actor) {
            return this.executeNext("false");
        }

        this.setOutputValue("target", target);

        const item =
            this.state === "slug"
                ? findItemWithSlug(target.actor, await this.getInputValue("slug"))
                : findItemWithSourceId(target.actor, await this.getInputValue("uuid"));

        if (item) {
            this.setOutputValue("item", item);
            return this.executeNext("true");
        } else {
            return this.executeNext("false");
        }
    }
}

type Inputs = {
    slug: string;
    target?: TargetDocuments;
    uuid: string;
};

type Outputs = {
    item?: ItemPF2e;
    target?: TargetDocuments;
};

export { HasItemConditionNode };
