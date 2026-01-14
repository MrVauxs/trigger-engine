import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";
import { BaseConditionNode } from ".";
import { ItemPF2e, findItemWithSlug, findItemWithSourceId } from "module-helpers";

class HasItemNode extends BaseConditionNode<Inputs, { item?: ItemPF2e }, never, never, "uuid" | "slug"> {
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
        return [{ key: "item", type: "item" }];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("false");
        }

        const item =
            this.state === "slug"
                ? findItemWithSlug(actor, await this.getInputValue("slug"))
                : findItemWithSourceId(actor, await this.getInputValue("uuid"));

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

export { HasItemNode };
