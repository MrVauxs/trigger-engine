import { TriggerApplication, TriggerHook, TriggerPath, UserValue } from "engine";
import { MODULE } from "module-helpers";
import { ExecuteTriggerQueryOptions } from "queries";

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
        }

        const queryArgs: ExecuteTriggerQueryOptions = {
            args: {
                values: this.parseUserValues(values),
            },
            eventName: "execute-event",
            triggerPath,
            type: "execute-trigger",
            userId: game.userId,
        };

        return game.users.activeGM?.query(MODULE.path("user-query"), queryArgs);
    }
}

export { ExecuteHook };
