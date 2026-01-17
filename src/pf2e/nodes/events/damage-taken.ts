import { IconObject } from "_zod";
import { BaseEventNode } from "engine";
import { R } from "module-helpers";
import { CreateMessageHook, DamageTakenOptions, DamageTakenType, PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class DamageTakenEvent extends BaseEventNode<Inputs, Outputs> {
    static get type(): "damage-taken-event" {
        return "damage-taken-event";
    }

    static get tags(): string[] {
        return ["chat", "damage"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            {
                key: "requires",
                type: "boolean",
                field: {
                    default: true,
                },
            },
            {
                key: "when",
                type: "text",
                field: {
                    type: "select",
                    default: "damage",
                    options: CreateMessageHook.damageTakenTypes,
                },
            },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [
            { key: "origin", type: "target" },
            { key: "target", type: "target" },
            { key: "item", type: "item" },
            { key: "options", type: "text", isArray: true },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\ue4dc", fontWeight: "900" };
    }

    async _execute({ item, options, origin, target, types }: DamageTakenOptions): Promise<boolean> {
        const requires = await this.getInputValue("requires");

        if (requires && !origin) {
            return this.executeNext("out");
        }

        const when = await this.getInputValue("when");

        if (!R.isIncludedIn(when, types)) {
            return this.executeNext("out");
        }

        this.setOutputValue("item", item);
        this.setOutputValue("options", options);
        this.setOutputValue("origin", origin);
        this.setOutputValue("target", target);

        return this.executeNext("out");
    }
}

type Inputs = {
    requires: boolean;
    when: DamageTakenType;
};

type Outputs = Omit<DamageTakenOptions, "types">;

export { DamageTakenEvent };
