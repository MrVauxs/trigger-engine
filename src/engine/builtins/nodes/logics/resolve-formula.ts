import { BaseLogicNode, BuiltinsCustomEntry, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";
import { ItemPF2e, localize } from "foundry-helpers";

class ResolveFormulaLogicNode extends BaseLogicNode<"out", Inputs, Outputs, "variable", never, "formula" | "value"> {
    static get type(): "resolve-formula" {
        return "resolve-formula";
    }

    static get tags(): string[] {
        return ["number"];
    }

    static get states(): string[] {
        return ["value", "formula"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "formula",
                type: "text",
                tooltip: localize.path("builtins.shared.variables.tooltip"),
            },
            { key: "actor", type: "target", state: "value" },
            { key: "item", type: "item", state: "value" },
        ];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [
            { key: "formula", type: "text", state: "formula" },
            { key: "value", type: "number", state: "value" },
        ];
    }

    static get defineCustomInputs(): BuiltinsCustomEntry[] {
        return [
            {
                slug: "variable",
                array: false,
                types: ["number"],
                input: {
                    replaceLabel: true,
                    validation: "^[a-z]+$",
                },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        let formula = await this.getInputValue("formula");

        if (!formula) {
            return this.executeNext("out");
        }

        const variables = await this.getCustomInputs("variable");

        for (const { label, value } of variables) {
            const regex = new RegExp(`@${label}`, "gm");
            formula = formula.replace(regex, value);
        }

        if (this.state === "formula") {
            this.setOutputValue("formula", formula);
        } else {
            const actor = (await this.getInputValue("actor"))?.actor;
            const item = await this.getInputValue("item");
            const roll = new Roll(formula, { actor, item });
            const total = (await roll.evaluate()).total;

            this.setOutputValue("value", total);
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    actor?: TargetDocuments;
    item?: ItemPF2e;
    formula: string;
};

type Outputs = {
    formula: string;
    value: number;
};

export { ResolveFormulaLogicNode };
