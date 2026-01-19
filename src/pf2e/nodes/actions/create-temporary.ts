import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { DurationInputs, DurationState, durationSchemas, durationStates, getDurationData } from ".";
import { createCustomEffect, joinStr } from "module-helpers";

class CreateTemporaryActionNode extends BaseActionNode<"out", Inputs, never, never, never, DurationState> {
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
        return [{ key: "target", type: "target" }, { key: "identifier", type: "text" }, ...durationSchemas()];
    }

    get icon(): IconObject {
        return { unicode: "\uf890" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const identifier = await this.getInputValue("identifier");
        const duration = await getDurationData.call(this);

        const source = createCustomEffect({
            duration,
            img: "icons/svg/clockwork.svg",
            itemSlug: joinStr("-", this.triggerPath, identifier),
            name: identifier ? `${this.triggerName} (${identifier})` : this.triggerName,
            show: false,
        });

        await actor.createEmbeddedDocuments("Item", [source]);

        return this.executeNext("out");
    }
}

type Inputs = DurationInputs & {
    identifier: string;
    target?: TargetDocuments;
};

export { CreateTemporaryActionNode };
