import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { createCustomEffect } from "module-helpers";
import { PF2eInputEntry } from "pf2e";
import {
    DurationState,
    TriggerEffectInputs,
    createEmbeddedItem,
    durationSchemas,
    durationStates,
    getDurationData,
    getTriggerEffectData,
    triggerEffectSchemas,
} from ".";

class CreateTemporaryActionNode extends BaseActionNode<"out", TriggerEffectInputs, never, never, never, DurationState> {
    static get type(): "create-temporary" {
        return "create-temporary";
    }

    static get tags(): string[] {
        return ["duration", "effect", "item"];
    }

    static get states(): string[] {
        return [...durationStates];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [...triggerEffectSchemas(), ...durationSchemas()];
    }

    get icon(): IconObject {
        return { unicode: "\uf890" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const { identifier, slug } = await getTriggerEffectData.call(this);
        const duration = await getDurationData.call(this);

        const source = createCustomEffect({
            duration,
            img: "icons/svg/clockwork.svg",
            itemSlug: slug,
            name: identifier ? `${this.triggerName} (${identifier})` : this.triggerName,
            show: false,
            unidentified: true,
        });

        await createEmbeddedItem(actor, source);

        return this.executeNext("out");
    }
}

export { CreateTemporaryActionNode };
