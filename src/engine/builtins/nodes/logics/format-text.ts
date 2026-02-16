import {
    BaseLogicNode,
    BuiltinsCustomEntry,
    BuiltinsInputEntry,
    BuiltinsOutputEntry,
    DescriptionInputs,
    DescriptionState,
    descriptionSchemas,
    descriptionStates,
    getDescriptionData,
} from "engine";
import { localize } from "foundry-helpers";

class FormatTextLogicNode extends BaseLogicNode<
    "out",
    Inputs,
    { result: string },
    "variable",
    never,
    DescriptionState
> {
    static get type(): "format-text" {
        return "format-text";
    }

    static get tags(): string[] {
        return ["text"];
    }

    static get states(): string[] {
        return descriptionStates;
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return descriptionSchemas(localize.path("builtins.shared.variables.tooltip"));
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [{ key: "result", type: "text" }];
    }

    static get defineCustomInputs(): BuiltinsCustomEntry[] {
        return [
            {
                slug: "variable",
                array: false,
                types: ["text"],
                input: {
                    replaceLabel: true,
                    validation: "^[a-z]+$",
                },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        const { content, key, plain } = await getDescriptionData.call(this);
        const variables = await this.getCustomInputs("variable");

        let result = key ? game.i18n.localize(key) : (plain ?? content ?? "");

        for (const { label, value } of variables) {
            const regex = new RegExp(`@${label}`, "gm");
            result = result.replace(regex, value);
        }

        this.setOutputValue("result", result);

        return this.executeNext("out");
    }
}

type Inputs = DescriptionInputs;

export { FormatTextLogicNode };
