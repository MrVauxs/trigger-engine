import { TriggerApplication, TriggerHook, TriggerPath, UserValue } from "engine";

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

    #execute(triggerPath: TriggerPath, values: UserValue[]) {
        return TriggerApplication.executeTriggerEvent(game.userId, triggerPath, "execute-event", {
            values: this.parseUserValues(values),
        });
    }

    #executeAsGM(triggerPath: TriggerPath, values: UserValue[]) {
        if (game.user.isActiveGM) {
            return this.#execute(triggerPath, values);
        } else {
            return this.executeTriggerEventAsGM(triggerPath, "execute-event", {
                converted: true,
                values: this.parseUserValues(values, true).map(this.convertToEmitable.bind(this)),
            });
        }
    }
}

export { ExecuteHook };
