import { TriggerHook } from "engine";
import { createToggleableHook } from "module-helpers";
import { checkRollData } from ".";

class ToolbeltSaveHook extends TriggerHook {
    #hook = createToggleableHook("pf2e-toolbelt.rollSave", this.#onToolbeltSave.bind(this));

    get events(): ["check-roll-event"] {
        return ["check-roll-event"];
    }

    _enable() {
        this.#hook.activate();
    }

    _disable() {
        this.#hook.disable();
    }

    async #onToolbeltSave({ rollMessage: message }: toolbelt.targetHelper.RollSaveHook) {
        const checkData = await checkRollData(message);
        if (checkData) {
            this.executeEvent("check-roll-event", checkData);
        }
    }
}

export { ToolbeltSaveHook };
