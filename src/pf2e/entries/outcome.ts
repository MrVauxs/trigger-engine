import { BaseInputEntrySchema, NodeEntry } from "engine";
import { DegreeOfSuccessString, R, degreeOfSuccessString, isDegreeOfSuccessValue } from "foundry-helpers";
import { OutcomeField, OutcomeFieldSchema } from ".";
import { DEGREE_OF_SUCCESS_STRINGS } from "foundry-helpers/dist";

class OutcomEntry extends NodeEntry<OutcomeEntryType, OutcomeFieldSchema> {
    static options: OutcomeOption[] = R.map(["null", ...DEGREE_OF_SUCCESS_STRINGS] as const, (value) => {
        return {
            value,
            label: value === "null" ? "trigger-engine.node.null" : `PF2E.Check.Result.Degree.Check.${value}`,
        };
    });

    static get type(): "outcome" {
        return "outcome";
    }

    static get FieldClass(): typeof OutcomeField {
        return OutcomeField;
    }

    static get default(): OutcomeEntryType {
        return "null";
    }

    static get color(): ColorSource {
        return 0x75db32;
    }

    static castValue(value: unknown): any {
        if (!isDegreeOfSuccessValue(value)) return value;
        return R.isString(value) ? value : degreeOfSuccessString(value);
    }

    static isValidType(value: unknown): value is OutcomeEntryType {
        return value === "null" || isDegreeOfSuccessValue(value);
    }

    static toJSON(value: DegreeOfSuccessString): DegreeOfSuccessString {
        return value;
    }

    static fromJSON(value: DegreeOfSuccessString): DegreeOfSuccessString {
        return value;
    }

    get options(): OutcomeOption[] {
        return OutcomEntry.options;
    }

    get default(): OutcomeEntryType {
        return this.getSelectValue(this.field.default);
    }

    generateTooltip(): undefined {
        return undefined;
    }

    getSelectValue(value: string | undefined | null): OutcomeEntryType {
        return this.options.find((option) => option.value === value)
            ? (value as OutcomeEntryType)
            : this.options[0].value;
    }

    processValue(value: string): OutcomeEntryType {
        return this.getSelectValue(value);
    }
}

type OutcomeOption = {
    value: OutcomeEntryType;
    label: string | undefined;
};

type InputOutcomeEntry = BaseInputEntrySchema<"outcome", Partial<OutcomeFieldSchema>>;

type OutcomeEntryType = DegreeOfSuccessString | "null";

export { OutcomEntry };
export type { InputOutcomeEntry, OutcomeEntryType };
