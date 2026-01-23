import { IconObject } from "_zod";
import { BaseValueNode, BuiltinsOutputEntry } from "engine";
import { ItemPF2e, getItemFromUuid } from "module-helpers";
import { PF2eInputEntry } from "pf2e";
import {
    DoubleUuidInputs,
    doubleUuidSchemas,
    getDoubleUuidValue,
    getIconFromDoubleUuid,
    getLocalItemFromSourceUuid,
} from "..";

class ItemValueNode extends BaseValueNode<DoubleUuidInputs> {
    #item?: ItemPF2e | null;

    static get type(): "item-value" {
        return "item-value";
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return doubleUuidSchemas();
    }

    static get defineOutputs(): [BuiltinsOutputEntry] {
        return [{ key: "item", type: "item" }];
    }

    get title(): string | null {
        return getLocalItemFromSourceUuid.call(this)?.name ?? super.title;
    }

    get icon(): IconObject | string | null {
        return getIconFromDoubleUuid.call(this, null);
    }

    async _query(): Promise<ItemPF2e | undefined> {
        if (this.#item === undefined) {
            const uuid = await getDoubleUuidValue.call(this);
            this.#item = await getItemFromUuid(uuid);
        }
        return this.#item ?? undefined;
    }
}

export { ItemValueNode };
