import { ItemPF2e } from "foundry-helpers";
import { BaseSingleHook } from ".";

abstract class BaseItemHook extends BaseSingleHook<ItemEventOptions> {
    _onEvent(item: ItemPF2e): void {
        const actor = item.actor;

        if (!item.pack && this.isValidActor(actor)) {
            this.executeEvent(this.events[0], { item, parent: { actor } });
        }
    }
}

type ItemEventOptions = {
    item: ItemPF2e;
    parent: TargetDocuments;
};

export { BaseItemHook };
export type { ItemEventOptions };
