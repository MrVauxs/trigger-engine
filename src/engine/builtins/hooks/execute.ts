import { TriggerApplication, TriggerHook, TriggerPath } from "engine";
import { MODULE, R } from "module-helpers";
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

    #execute(triggerPath: TriggerPath, values: any[]) {
        return TriggerApplication.executeTriggerEvent(game.userId, triggerPath, "execute-event", {
            values: R.isArray(values) ? values : [],
        });
    }

    #executeAsGM(triggerPath: TriggerPath, values: any[]) {
        if (game.user.isActiveGM) {
            return this.#execute(triggerPath, values);
        }

        const queryArgs: ExecuteTriggerQueryOptions = {
            args: {
                values: R.isArray(values) ? values : [],
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
