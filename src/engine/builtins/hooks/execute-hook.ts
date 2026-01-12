import { TriggerHook, TriggerPath, UserValue, getTriggerPathData } from "engine";

class ExecuteHook extends TriggerHook<ExecuteEventOptions> {
    static executePath = "game.triggerEngine.execute";

    static get type(): "execute-hook" {
        return "execute-hook";
    }

    get events(): ["execute-event"] {
        return ["execute-event"];
    }

    _enable(): void {
        foundry.utils.setProperty(globalThis, ExecuteHook.executePath, this.#execute.bind(this));
    }

    _disable(): void {
        foundry.utils.setProperty(globalThis, ExecuteHook.executePath, () => {});
    }

    #execute(triggerPath: TriggerPath, values: UserValue[]) {
        const { applicationKey, triggerId } = getTriggerPathData(triggerPath);
        if (this.applicationKey !== applicationKey) return;

        const parsed = this.parseUserValues(values);

        if (game.user.isActiveGM) {
            this.executeTriggerEvent(triggerId, "execute-event", {
                values: parsed.map((x) => x?.value),
            } satisfies ExecuteEventOptions);
        } else {
            this.executeTriggerEventAsGM(triggerId, "execute-event", {
                converted: true,
                values: this.convertValuesToEmitable(parsed),
            } satisfies ExecuteEventOptions);
        }
    }
}

type ExecuteEventOptions = {
    converted?: boolean;
    values: (UserValue | undefined)[];
};

export { ExecuteHook };
export type { ExecuteEventOptions };
