import { ItemPF2e, findItemWithSlug, findItemWithSourceId } from "foundry-helpers";
import { BaseConditionNode } from "engine";
import {
    DoubleUuidInputs,
    doubleUuidSchemas,
    getDoubleUuidValue,
    getIconFromDoubleUuid,
    getLocalItemFromSourceUuid,
} from "..";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";
import { IconObject } from "_zod";

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
            ...doubleUuidSchemas("uuid"),
            { key: "slug", type: "text", state: "slug" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "item", type: "item" }];
    }

    get title(): string | null {
        return getLocalItemFromSourceUuid.call(this)?.name ?? super.title;
    }

    get subtitle(): string | null {
        return getLocalItemFromSourceUuid.call(this) ? super.title : super.subtitle;
    }

    get icon(): IconObject | string | null {
        return getIconFromDoubleUuid.call(this, super.icon);
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("false");
        }

        const item =
            this.state === "slug"
                ? findItemWithSlug(actor, await this.getInputValue("slug"))
                : findItemWithSourceId(actor, await getDoubleUuidValue.call(this));

        if (item) {
            this.setOutputValue("item", item);
            return this.executeNext("true");
        } else {
            return this.executeNext("false");
        }
    }
}

type Inputs = DoubleUuidInputs & {
    slug: string;
    target?: TargetDocuments;
};

type Outputs = {
    item?: ItemPF2e;
};

export { HasItemConditionNode };
