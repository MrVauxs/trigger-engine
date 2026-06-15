import { NodeEntry } from "engine";
import { ItemPF2e, ItemUUID, R } from "foundry-helpers";

class ItemEntry extends NodeEntry<ItemPF2e | undefined> {
    static get type(): "item" {
        return "item";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0x696fe0;
    }

    static isValidType(value: unknown): value is ItemPF2e {
        return value instanceof Item;
    }

    static toJSON(value: ItemPF2e): ItemUUID {
        return value.uuid;
    }

    static async fromJSON(value: unknown): Promise<ItemPF2e | undefined> {
        const item = R.isString(value) ? await fromUuid<ItemPF2e>(value) : undefined;
        return this.isValidType(item) ? item : undefined;
    }
}

export { ItemEntry };
