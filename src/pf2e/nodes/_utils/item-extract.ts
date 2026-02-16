import { ItemPF2e, localize, parseInlineParams } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e/entries";

function extractItemInputs({ group, state }: { group?: string; state?: string } = {}): PF2eInputEntry[] {
    return [
        {
            key: "index",
            type: "number",
            group,
            label: localize.path("pf2e-trigger.shared.item-extraction.index.title"),
            state,
            field: { default: 1, min: 1 },
        },
    ];
}

function extractItemInline(
    item: ItemPF2e,
    index: number,
    type: "type" | "formula",
): Record<string, string | undefined> | null | undefined {
    const description = item.description;

    let count = 0;
    let match: RegExpExecArray | null = null;

    const regex =
        type === "formula"
            ? /@Damage\[((?:[^[\]]|\[[^[\]]*\])*)\]/gm
            : /@Check\[(?=.*\b(will|reflex|fortitude)\b)([^\]]+)\]/gm;

    const matchIndex = type === "formula" ? 1 : 2;

    while ((match = regex.exec(description)) !== null) {
        if (++count >= index) {
            return parseInlineParams(match[matchIndex], { first: type });
        }
    }
}

type ItemExtractInputs = {
    index: number;
};

export { extractItemInline, extractItemInputs };
export type { ItemExtractInputs };
