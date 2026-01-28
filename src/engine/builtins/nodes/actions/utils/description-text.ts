import { BuiltinsInputEntry, TriggerNode } from "engine";

const descriptionStates = ["description", "localization"];

function descriptionSchemas(withPlain?: boolean): BuiltinsInputEntry[] {
    const schemas: BuiltinsInputEntry[] = [
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

    if (withPlain) {
        schemas.unshift({
            key: "plain",
            type: "text",
            state: "plain",
        });
    }

    return schemas;
}

async function getDescriptionInputs(
    this: TriggerNode<any, DescriptionInputs, any, any, any, DescriptionState>,
): Promise<DescriptionInputsData> {
    return {
        content: this.state === "description" ? await this.getInputValue("content") : undefined,
        key: this.state === "localization" ? await this.getInputValue("localization") : undefined,
        plain: this.state === "plain" ? await this.getInputValue("plain") : undefined,
    };
}

async function localizeKeyOrDescription({ content, key }: DescriptionInputsData): Promise<string> {
    return key ? game.i18n.localize(key) : foundry.applications.ux.TextEditor.implementation.enrichHTML(content ?? "");
}

type DescriptionState = "plain" | "description" | "localization";

type DescriptionInputs = {
    content: string;
    localization: string;
    plain: string;
};

type DescriptionInputsData = {
    content: string | undefined;
    key: string | undefined;
    plain: string | undefined;
};

export { descriptionSchemas, descriptionStates, getDescriptionInputs, localizeKeyOrDescription };
export type { DescriptionInputs, DescriptionState };
