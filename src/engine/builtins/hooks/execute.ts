import { ExecuteEventOptions, TriggerApplication, TriggerHook, TriggerPath } from "engine";
import { R } from "module-helpers";

class ExecuteHook extends TriggerHook {
    static executePath = "game.triggerEngine.execute";
    static executeAsGmPath = "game.triggerEngine.executeAsGM";

    static get type(): "execute-hook" {
        return "execute-hook";
    }

    get events(): ["execute-event"] {
        return ["execute-event"];
    }

    _enable(): void {
        foundry.utils.setProperty(globalThis, ExecuteHook.executePath, this.#execute.bind(this));
        foundry.utils.setProperty(globalThis, ExecuteHook.executeAsGmPath, this.#executeAsGM.bind(this));
    }

    _disable(): void {
        foundry.utils.setProperty(globalThis, ExecuteHook.executePath, () => {});
        foundry.utils.setProperty(globalThis, ExecuteHook.executeAsGmPath, () => {});
    }

    #execute(triggerPath: TriggerPath, ...values: any[]) {
        const args: ExecuteEventOptions = {
            userId: game.userId,
            values: R.isArray(values) ? values : [],
        };

        TriggerApplication.executeTriggerEvent(triggerPath, "execute-event", args);
    }

    #executeAsGM(triggerPath: TriggerPath, values: any[]) {}
}

export { ExecuteHook };
