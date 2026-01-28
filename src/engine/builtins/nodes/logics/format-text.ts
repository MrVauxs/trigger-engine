import {
    BaseLogicNode,
    BuiltinsCustomEntry,
    BuiltinsInputEntry,
    BuiltinsOutputEntry,
    DescriptionInputs,
    DescriptionState,
    descriptionSchemas,
    descriptionStates,
    getDescriptionInputs,
} from "engine";

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
        return ["plain", ...descriptionStates];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return descriptionSchemas(true);
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
        const { content, key, plain } = await getDescriptionInputs.call(this);
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
