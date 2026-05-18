import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { PF2eInputEntry } from "pf2e";

class ToggleOptionActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "toggle-option" {
        return "toggle-option";
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "checked", type: "boolean" },
            {
                key: "domain",
                type: "text",
                tooltip: "domain",
                field: {
                    default: "all",
                },
            },
            { key: "option", type: "text" },
            { key: "suboption", type: "text" },
            { key: "item", type: "text" },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\ue5b1" };
    }

    async _execute(): Promise<boolean> {
        const domain = await this.getInputValue("domain");
        const option = await this.getInputValue("option");
        const target = await this.getInputValue("target");

        if (!target || !domain || !option) {
            return this.executeNext("out");
        }

        const checked = await this.getInputValue("checked");
        const itemId = await this.getInputValue("item");
        const suboption = await this.getInputValue("suboption");

        await target.actor.toggleRollOption(domain, option, itemId || null, checked, suboption || undefined);

        return this.executeNext("out");
    }
}

type Inputs = {
    checked: boolean;
    domain: string;
    item: string;
    option: string;
    suboption: string;
    target?: TargetDocuments;
};

export { ToggleOptionActionNode };
