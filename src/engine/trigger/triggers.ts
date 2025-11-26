import { getSetting } from "module-helpers";
import { Trigger, TriggerData, TriggerDataSource } from ".";
import { prepareHooks } from "engine/hooks";

async function prepareModuleTriggers() {}

function prepareWorldTriggers() {
    const sources = getSetting<TriggerDataSource[]>("world-triggers");
    const system = game.system.id;
    const triggers: Trigger[] = [];

    try {
        for (const source of sources) {
            if (source.system !== system) continue;

            const data = new TriggerData(source);
            if (data.invalid) continue;

            const trigger = new Trigger(data);
            triggers.push(trigger);
        }
    } catch (error) {}

    prepareHooks(triggers);
}

export { prepareModuleTriggers, prepareWorldTriggers };
