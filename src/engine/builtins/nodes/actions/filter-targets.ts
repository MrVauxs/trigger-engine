import { BuiltinsCustomEntry, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";
import { BaseActionNode } from ".";
import { IconObject } from "_zod";

const DEFAULT_CALLBACK = `/**
 * @param {{actor: Actor; token: TokenDocument}} target
 * @param {unknown[]} inputs
 * @returns {boolean}
 *
 * @example
 * const level = inputs[0];
 * return target.actor.level >= level;
 */
return true;`;

class FilterTargetsActionNode extends BaseActionNode<"out", Inputs, Outputs, "input", never, "filter" | "find"> {
    static get type(): "filter-targets" {
        return "filter-targets";
    }

    static get states(): string[] {
        return ["filter", "find"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "targets", type: "target", isArray: true },
            {
                key: "callback",
                type: "text",
                field: {
                    type: "javascript",
                    default: DEFAULT_CALLBACK,
                },
            },
        ];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [
            { key: "targets", type: "target", state: "filter", isArray: true },
            { key: "target", type: "target", state: "find" },
        ];
    }

    static get defineCustomInputs(): BuiltinsCustomEntry[] {
        return [{ slug: "input", array: true }];
    }

    get icon(): IconObject {
        return { unicode: this.state === "filter" ? "\ue17e" : "\uf0b0" };
    }

    get title(): string {
        return this.localize(this.state === "find" ? "titles.find" : "title") as string;
    }

    async _execute(): Promise<boolean> {
        const code = (await this.getInputValue("callback")) || "return true;";
        const targets = await this.getInputValue("targets");
        const inputs = await this.getCustomInputsValues("input");

        try {
            const Fn = function () {}.constructor as SyncFunction;
            const callback = new Fn("target", "inputs", code);

            if (this.state === "filter") {
                const newTargets = targets.filter((target) => callback(target, inputs));
                this.setOutputValue("targets", newTargets);
            } else {
                const target = targets.find((target) => callback(target, inputs));
                this.setOutputValue("target", target);
            }
        } catch {}

        return this.executeNext("out");
    }
}

type SyncFunction = {
    new (...args: any[]): (target: TargetDocuments, inputs: unknown[]) => boolean;
};

type Inputs = {
    callback: string;
    targets: TargetDocuments[];
};

type Outputs = {
    target?: TargetDocuments;
    targets: TargetDocuments[];
};

export { FilterTargetsActionNode };
