import { TriggerNode } from "engine";
import { R, RollNoteSource, getExtraRollOptions, localizePath, splitListString } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

function rollLocalizePath(...path: string[]): string {
    return localizePath("pf2e-trigger.shared.roll-data", ...path);
}

function rollDataSchemas(): PF2eInputEntry[] {
    return [
        { key: "options", type: "text", group: "roll", label: rollLocalizePath("options.title") },
        { key: "traits", type: "text", group: "roll", label: rollLocalizePath("traits.title") },
        {
            key: "note",
            type: "text",
            group: "roll",
            label: rollLocalizePath("note.title"),
            field: { type: "enriched" },
        },
    ];
}

async function getRollData(
    this: TriggerNode<any, RollDataInputs>,
    { extraOptions = [], extraTraits = [], isBasic = false }: RollDataOptions = {},
): Promise<{ extraRollOptions: string[]; extraRollNotes: RollNoteSource[] }> {
    const note = (await this.getInputValue("note"))
        .replace(/\n/gm, "")
        .replace(/<p>/gm, "")
        .replace(/<\/p>/gm, " ")
        .trim();

    const options = splitListString(await this.getInputValue("options"));
    const traits = splitListString(await this.getInputValue("traits"));

    const extraRollOptions = getExtraRollOptions(
        { options: R.unique([...options, ...extraOptions]), traits: R.unique([...traits, ...extraTraits]) },
        isBasic,
    );

    return {
        extraRollOptions,
        extraRollNotes: note ? [{ text: note, selector: "all" }] : [],
    };
}

type RollDataOptions = {
    extraOptions?: string[];
    extraTraits?: string[];
    isBasic?: boolean;
};

type RollDataInputs = {
    note: string;
    options: string;
    traits: string;
};

export { getRollData, rollDataSchemas };
export type { RollDataInputs };
