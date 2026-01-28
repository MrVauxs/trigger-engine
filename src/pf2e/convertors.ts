import { EntryConvertor } from "engine";
import {
    degreeOfSuccessNumber,
    DegreeOfSuccessString,
    degreeOfSuccessString,
    isDegreeOfSuccessValue,
} from "module-helpers";

const pf2eConvertors = [
    {
        output: "number",
        input: "outcome",
        convertToInput: (value: number): DegreeOfSuccessString | undefined => {
            return degreeOfSuccessString(value);
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
        output: "outcome",
        input: "text",
        convertToInput: (outcome: DegreeOfSuccessString): string => {
            return outcome;
        },
    },
    {
        output: "text",
        input: "outcome",
        convertToInput: (value: string): DegreeOfSuccessString | undefined => {
            return isDegreeOfSuccessValue(value) ? value : undefined;
        },
    },
    {
        output: "target",
        input: "text",
        convertToInput: (target: TargetDocuments): string => {
            return target.actor.signature;
        },
    },
] as const satisfies EntryConvertor[];

export { pf2eConvertors };
