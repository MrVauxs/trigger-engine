import { RegionEventOptions, TriggerEngineRegionBehaviorType } from "engine";
import { ActorPF2e, createTargetDocuments, ItemOriginFlag, ItemPF2e, RegionEventPF2e, SYSTEM } from "foundry-helpers";

class PF2eTriggerEngineRegionBehaviorType extends TriggerEngineRegionBehaviorType {
    async _createRegionEventOptions(event: RegionEventPF2e, target: TargetDocuments): Promise<PF2eRegionEventOptions> {
        const flag: Partial<ItemOriginFlag> = this.region?.flags[SYSTEM.id]?.origin ?? {};
        const actor = flag.actor ? await fromUuid<ActorPF2e>(flag.actor) : null;
        const item = flag.uuid ? await fromUuid<ItemPF2e>(flag.uuid) : null;
        const baseOptions = await super._createRegionEventOptions(event, target);

        return {
            ...baseOptions,
            item: item ?? undefined,
            options: flag.rollOptions || [],
            origin: createTargetDocuments({ actor }),
        };
    }
}

type PF2eRegionEventOptions = RegionEventOptions & {
    item?: ItemPF2e;
    options: string[];
    origin?: TargetDocuments;
};

export { PF2eTriggerEngineRegionBehaviorType };
export type { PF2eRegionEventOptions };
