import { TriggerHook } from "engine";
import { ChatMessagePF2e, createToggleableHook } from "module-helpers";
import { checkRollData } from ".";

class ToolbeltSaveHook extends TriggerHook {
    #hook = createToggleableHook(
        ["pf2e-toolbelt.rollSave", "pf2e-toolbelt.rerollSave"],
        this.#onToolbeltSave.bind(this),
    );
    // #hook = createToggleableHook("pf2e-toolbelt.rerollSave", this.#onToolbeltSave.bind(this));

    get events(): ["check-roll-event"] {
        return ["check-roll-event"];
    }

    _enable() {
        this.#hook.activate();
    }

    _disable() {
        this.#hook.disable();
    }

    async #onToolbeltSave({
        data,
        message,
        rollMessage,
    }: {
        data: toolbelt.targetHelper.MessageTargetSave;
        message: ChatMessagePF2e;
        rollMessage?: ChatMessagePF2e;
    }) {
        const checkData = await checkRollData(rollMessage ?? message, !!data.rerolled);
        if (checkData) {
            this.executeEvent("check-roll-event", checkData);
        }
    }
}

export { ToolbeltSaveHook };
