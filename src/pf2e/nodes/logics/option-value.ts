import { IconObject } from "_zod";
import { BaseLogicNode } from "engine";
import { R } from "module-helpers";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class OptionValueLogicNode extends BaseLogicNode<"out", Inputs, { value: string }> {
    static get type(): "option-value" {
        return "option-value";
    }

    static get tags(): string[] {
        return ["option"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "option", type: "text" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "value", type: "text" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf0cb" };
    }

    async _execute(): Promise<boolean> {
        const input = await this.getInputValue("option");
        const target = await this.getInputValue("target");

        if (!input || !target) {
            return this.executeNext("out");
        }

        const withSuffix = `${input}:`;

        for (const options of R.values(target.actor.rollOptions)) {
            if (!options) continue;

            for (const [option, active] of R.entries(options)) {
                if (!active) continue;

                if (option.startsWith(withSuffix)) {
                    const value = option.split(":").at(-1) as string;
                    this.setOutputValue("value", value);
                    return this.executeNext("out");
                }
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    option: string;
    target?: TargetDocuments;
};

export { OptionValueLogicNode };
