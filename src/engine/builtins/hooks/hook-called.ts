import { TriggerHook } from "engine";
import { TriggerDataInput } from "engine";
import { MODULE } from "foundry-helpers";

class HookCalledHook extends TriggerHook<any[]> {
    #hooks: { hookId: number; hookName: string }[] = [];

    static get type(): "hook-called-hook" {
        return "hook-called-hook";
    }

    get events(): ["hook-called-event"] {
        return ["hook-called-event"];
    }

    get gmOnly(): boolean {
        return false;
    }

    _enable(triggers: TriggerDataInput[]): void {
        const userIsGM = game.user.isGM;
        const eventType = this.events[0];
        const hooks = new Set<string>();

        for (const trigger of triggers) {
            const triggerId = trigger.id;
            if (!triggerId) continue;

            const event = trigger.nodes?.find((node) => node.type === eventType);
            if (!event?.inputs) continue;

            const gmOnly = !!event.inputs.gm?.value;
            if (gmOnly && !userIsGM) continue;

            const hookName = (event.inputs.name?.value as string | undefined)?.trim();
            if (!hookName) continue;

            const hookId = Hooks.on(hookName, (...args: any[]) => {
                if (gmOnly && !game.user.isActiveGM) return;
                this.executeTriggerEvent(triggerId, eventType, args);
            });

            hooks.add(hookName);
            this.#hooks.push({ hookId, hookName });
        }

        MODULE.debug(hooks);
    }

    _disable(): void {
        for (const { hookId, hookName } of this.#hooks) {
            Hooks.off(hookName, hookId);
        }
    }
}

export { HookCalledHook };
