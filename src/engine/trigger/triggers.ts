import { RegisteredApplication } from "engine/application";

async function prepareModuleTriggers() {}

function prepareTriggers(apps: RegisteredApplication[]) {
    // const sources = getSetting<TriggerDataSource[]>("world-triggers");
    // const system = game.system.id;
    // const triggers: Trigger[] = [];
    // try {
    //     for (const source of sources) {
    //         // if (source.system !== system) continue;
    //         // const data = new TriggerData(source);
    //         // if (data.invalid) continue;
    //         // const trigger = new Trigger(data);
    //         // triggers.push(trigger);
    //     }
    // } catch (error) {}
    // prepareHooks(triggers);

    console.log(apps);
}

export { prepareModuleTriggers, prepareTriggers };
