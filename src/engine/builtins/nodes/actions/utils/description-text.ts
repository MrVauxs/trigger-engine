import { BuiltinsInputEntry, TriggerNode } from "engine";

const descriptionStates = ["description", "localization"];

let DESCRIPTION_SCHEMAS: BuiltinsInputEntry[] | undefined;

function descriptionSchemas(): BuiltinsInputEntry[] {
    return (DESCRIPTION_SCHEMAS ??= [
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
    ]);
}

async function getDescriptionInputs(
    this: TriggerNode<any, DescriptionInputs, any, any, any, DescriptionState>,
): Promise<DescriptionInputsData> {
    return {
        content: this.state === "description" ? await this.getInputValue("content") : undefined,
        key: this.state === "localization" ? await this.getInputValue("localization") : undefined,
    };
}

async function localizeKeyOrDescription({ content, key }: DescriptionInputsData): Promise<string> {
    return key ? game.i18n.localize(key) : foundry.applications.ux.TextEditor.implementation.enrichHTML(content ?? "");
}

type DescriptionState = "description" | "localization";

type DescriptionInputs = {
    content: string;
    localization: string;
};

type DescriptionInputsData = {
    content: string | undefined;
    key: string | undefined;
};

export { descriptionSchemas, descriptionStates, getDescriptionInputs, localizeKeyOrDescription };
export type { DescriptionInputs, DescriptionState };
