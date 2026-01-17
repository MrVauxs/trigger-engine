import { IconObject } from "_zod";
import { BaseValueNode, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";
import { ItemPF2e, getItemFromUuid } from "module-helpers";

class ItemValueNode extends BaseValueNode<{ uuid: string }> {
    #item?: ItemPF2e | null;

    static get type(): "item-value" {
        return "item-value";
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): [BuiltinsInputEntry] {
        return [{ key: "uuid", type: "text" }];
    }

    static get defineOutputs(): [BuiltinsOutputEntry] {
        return [{ key: "item", type: "item" }];
    }

    get localItem(): CompendiumIndexData | undefined | null {
        const uuid = this.getLocalValue("uuid");
        if (!uuid) return;

        const item = fromUuidSync<CompendiumIndexData>(uuid);
        if (!item) return null;

        return item instanceof Item || foundry.utils.parseUuid(item.uuid)?.type === "Item" ? item : null;
    }

    get title(): string | null {
        return this.localItem?.name ?? super.title;
    }

    get icon(): IconObject | string | null {
        const item = this.localItem;
        return item === null ? { unicode: "\uf127" } : (item?.img ?? null);
    }

    async _query(): Promise<ItemPF2e | undefined> {
        if (this.#item === undefined) {
            const uuid = await this.getInputValue("uuid");
            this.#item = await getItemFromUuid(uuid);
        }
        return this.#item ?? undefined;
    }
}

export { ItemValueNode };
