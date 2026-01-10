import { NodeEntry } from "engine";
import { ItemPF2e } from "module-helpers";

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

    static toJSON(value: ItemPF2e): string {
        return value.uuid;
    }

    static async fromJSON(value: string): Promise<ItemPF2e | undefined> {
        const item = await fromUuid<ItemPF2e>(value);
        return item instanceof Item ? item : undefined;
    }
}

export { ItemEntry };
