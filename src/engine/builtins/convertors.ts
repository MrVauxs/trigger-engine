import { EntryConvertor } from "engine";

export default [
    {
        input: "number",
        output: "text",
        convertToInput: (value: string): number => {
            return Number(value) || 0;
        },
    },
    {
        input: "text",
        output: "number",
        convertToInput: (value: number): string => {
            return String(value);
        },
    },
] as const satisfies EntryConvertor[];
