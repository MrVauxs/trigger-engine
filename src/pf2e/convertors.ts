import { EntryConvertor } from "engine";
import {
    DegreeOfSuccessString,
    degreeOfSuccessNumber,
    degreeOfSuccessString,
    isDegreeOfSuccessValue,
} from "module-helpers";

const pf2eConvertors = [
    {
        output: "outcome",
        input: "string",
        convertToInput: (value: DegreeOfSuccessString): string => {
            return value;
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
        convertToInput: (value: DegreeOfSuccessString): number => {
            return degreeOfSuccessNumber(value) || 0;
        },
    },
    {
        output: "number",
        input: "outcome",
        convertToInput: (value: number): DegreeOfSuccessString | undefined => {
            return degreeOfSuccessString(value);
        },
    },
] as const satisfies EntryConvertor[];

export { pf2eConvertors };
