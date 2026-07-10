import { NodeFieldSchema, TextField } from "engine";
import { DegreeOfSuccessString } from "foundry-helpers";

class RankField extends TextField {
    static get defineSchema(): NodeFieldSchema {
        return {
            connector: {
                default: true,
                type: "boolean",
            },
            default: { type: "string" },
            tooltip: {
                default: true,
                type: "boolean",
            },
            width: {
                default: 140,
                type: "number",
            },
        };
    }

    get isSimpleInput(): boolean {
        return false;
    }

    get isSelect(): boolean {
        return true;
    }

    get isEnrichedInput(): boolean {
        return false;
    }

    get isJSONInput(): boolean {
        return false;
    }

    get toDisplay(): string {
        const value = String(this.value);
        const option = this.options.find((option) => option.value === value) ?? this.options[0];
        return this.localizeOption(option);
    }

    processReturnedValue(value: string) {
        const numbered = Number(value);
        return this.entry.isValidType(numbered) ? numbered : this.entry.default;
    }
}

type RankFieldSchema = {
    connector: boolean;
    default?: DegreeOfSuccessString;
    tooltip: boolean;
    width: number;
};

export { RankField };
export type { RankFieldSchema };
