import { RegionEventOptions, TriggerEngineRegionBehaviorType } from "engine";
import {
    createTargetDocuments,
    getDocumentFromUUIDSync,
    ItemOriginFlag,
    ItemPF2e,
    RegionEventPF2e,
    SYSTEM,
} from "foundry-helpers";

class PF2eTriggerEngineRegionBehaviorType extends TriggerEngineRegionBehaviorType {
    _createRegionEventOptions(event: RegionEventPF2e, target: TargetDocuments): PF2eRegionEventOptions {
        const { actor, rollOptions, uuid }: Partial<ItemOriginFlag> = this.region?.flags[SYSTEM.id]?.origin ?? {};
        const origin = getDocumentFromUUIDSync("Actor", actor) || undefined;

        return {
            ...super._createRegionEventOptions(event, target),
            item: getDocumentFromUUIDSync("Item", uuid) || undefined,
            options: rollOptions ?? [],
            origin: createTargetDocuments({ actor: origin }),
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
