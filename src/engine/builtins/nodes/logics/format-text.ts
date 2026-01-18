import { BaseLogicNode, BuiltinsCustomEntry, BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";

class FormatTextLogicNode extends BaseLogicNode<
    "out",
    Inputs,
    { result: string },
    "variable",
    never,
    "description" | "localization"
> {
    static get type(): "format-text" {
        return "format-text";
    }

    static get tags(): string[] {
        return ["text"];
    }

    static get states(): string[] {
        return ["description", "localization"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "content",
                type: "text",
                field: { type: "enriched" },
                state: "description",
            },
            {
                key: "localization",
                type: "text",
                state: "localization",
            },
        ];
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
        let result =
            this.state === "description"
                ? await this.getInputValue("content")
                : game.i18n.localize(await this.getInputValue("localization"));

        const variables = await this.getCustomInputs("variable");

        for (const { label, value } of variables) {
            const regex = new RegExp(`@${label}`, "gm");
            result = result.replace(regex, value);
        }

        this.setOutputValue("result", result);

        return this.executeNext("out");
    }
}

type Inputs = {
    content: string;
    localization: string;
};

export { FormatTextLogicNode };
