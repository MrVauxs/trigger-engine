import { ActorPF2e, ItemPF2e, ItemSourcePF2e } from "foundry-helpers";

async function createEmbeddedItem<T extends ItemPF2e>(
    actor: ActorPF2e,
    source: PreCreate<ItemSourcePF2e>,
): Promise<T | null> {
    let i = 3;

    while (i) {
        try {
            const cloned = foundry.utils.deepClone(source);
            const item = await actor.createEmbeddedDocuments("Item", [cloned]);
            return item as any;
        } catch {
            i--;
        }
    }

    return null;
}

export { createEmbeddedItem };
