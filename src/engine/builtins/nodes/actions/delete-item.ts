import { BuiltinsInputEntry } from "engine";
import { ItemPF2e } from "foundry-helpers";
import { BaseActionNode } from ".";
import { IconObject } from "_zod";

class DeleteItemActionNode extends BaseActionNode<"out", { item?: ItemPF2e }> {
    static get type(): "delete-item" {
        return "delete-item";
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "item", type: "item" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf1f8" };
    }

    async _execute(): Promise<boolean> {
        const item = await this.getInputValue("item");

        if (item?.actor && !item.pack) {
            await item.delete();
        }

        return this.executeNext("out");
    }
}

export { DeleteItemActionNode };
