import { BaseInputEntrySchema, NodeEntry } from "engine";
import {
    DEGREE_STRINGS,
    DegreeOfSuccessString,
    R,
    degreeOfSuccessString,
    isDegreeOfSuccessValue,
} from "module-helpers";
import { OutcomeField, OutputFieldSchema } from ".";

class OutcomEntry extends NodeEntry<DegreeOfSuccessString, OutputFieldSchema> {
    static #options: OutcomeOption[] = DEGREE_STRINGS.map((value) => {
        return {
            value,
            label: `PF2E.Check.Result.Degree.Check.${value}`,
        };
    });

    static get type(): "outcome" {
        return "outcome";
    }

    static get FieldClass(): typeof OutcomeField {
        return OutcomeField;
    }

    static get default(): DegreeOfSuccessString {
        return "criticalFailure";
    }

    static get color(): ColorSource {
        return 0x75db32;
    }

    static isValidType(value: unknown): value is DegreeOfSuccessString {
        return isDegreeOfSuccessValue(value);
    }

    static toJSON(value: DegreeOfSuccessString): DegreeOfSuccessString {
        return value;
    }

    static fromJSON(value: DegreeOfSuccessString): DegreeOfSuccessString {
        return value;
    }

    get options(): OutcomeOption[] {
        return OutcomEntry.#options;
    }

    get default(): DegreeOfSuccessString {
        return this.getSelectValue(this.field.default);
    }

    generateTooltip(): undefined {
        return undefined;
    }

    castValue(value: unknown): any {
        if (!isDegreeOfSuccessValue(value)) return value;
        return R.isString(value) ? value : degreeOfSuccessString(value);
    }

    getSelectValue(value: string | undefined): DegreeOfSuccessString {
        return this.options.find((option) => option.value === value)
            ? (value as DegreeOfSuccessString)
            : this.options[0].value;
    }

    processValue(value: string): DegreeOfSuccessString {
        return this.getSelectValue(value);
    }
}

type OutcomeOption = {
    value: DegreeOfSuccessString;
    label: string;
};

type InputOutcomeEntry = BaseInputEntrySchema<"outcome", OutputFieldSchema>;

export { OutcomEntry };
export type { InputOutcomeEntry };
