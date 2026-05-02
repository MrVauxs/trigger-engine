import { ActorPF2e, ItemPF2e } from "foundry-helpers";
import { BaseConditionNode } from "engine";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

abstract class BaseHasItemConditionNode<TInputs extends { target?: TargetDocuments }> extends BaseConditionNode<
    TInputs,
    Outputs
> {
    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [...BaseConditionNode.defineOutputs, { key: "item", type: "item" }];
    }

    abstract getItem<T extends ActorPF2e>(actor: T): Promise<ItemPF2e<T> | null>;

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.execute("false");
        }

        const item = await this.getItem(actor);

        if (item) {
            this.setOutputValue("item", item);
            return this.execute("true");
        } else {
            return this.execute("false");
        }
    }
}

type Outputs = {
    boolean: boolean;
    item?: ItemPF2e;
};

export { BaseHasItemConditionNode };
