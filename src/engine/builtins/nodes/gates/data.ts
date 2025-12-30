import { zNodeCustoms } from "engine/node";
import { z, zID, zPosition, zString } from "module-helpers";

const zTriggerGateExit = z.object({
    custom: zNodeCustoms,
    id: zID,
    label: zString,
    position: zPosition,
});

const zTriggerGateEntry = z.object({
    id: zID,
    exit: zID,
    position: zPosition,
});

type TriggerGateExitSource = z.input<typeof zTriggerGateExit>;
type TriggerGateEntrySource = z.input<typeof zTriggerGateEntry>;

export { zTriggerGateEntry, zTriggerGateExit };
export type { TriggerGateEntrySource, TriggerGateExitSource };
