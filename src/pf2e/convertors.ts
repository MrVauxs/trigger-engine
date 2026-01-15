import { EntryConvertor } from "engine";
import {
    DegreeOfSuccessString,
    ItemPF2e,
    degreeOfSuccessNumber,
    degreeOfSuccessString,
    isDegreeOfSuccessValue,
} from "module-helpers";

const pf2eConvertors = [
    {
        output: "outcome",
        input: "string",
        convertToInput: (outcome: DegreeOfSuccessString): string => {
            return outcome;
        },
    },
    {
        output: "string",
        input: "outcome",
        convertToInput: (value: string): DegreeOfSuccessString | undefined => {
            return isDegreeOfSuccessValue(value) ? value : undefined;
        },
    },
    {
        output: "outcome",
        input: "number",
        convertToInput: (outcome: DegreeOfSuccessString): number => {
            return degreeOfSuccessNumber(outcome) || 0;
        },
    },
    {
        output: "number",
        input: "outcome",
        convertToInput: (value: number): DegreeOfSuccessString | undefined => {
            return degreeOfSuccessString(value);
        },
    },
    {
        output: "item",
        input: "target",
        convertToInput: (item: ItemPF2e): TargetDocuments | undefined => {
            const actor = item.actor;
            return actor ? { actor } : undefined;
        },
    },
] as const satisfies EntryConvertor[];

export { pf2eConvertors };
