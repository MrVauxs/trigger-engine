import { EntryConvertor } from "engine";
import { UserPF2e, primaryPlayerOwner } from "module-helpers";

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
    {
        input: "target",
        output: "user",
        convertToInput: (user: UserPF2e): TargetDocuments | undefined => {
            const actor = user.character;
            return actor ? { actor } : undefined;
        },
    },
    {
        input: "user",
        output: "target",
        convertToInput: (target: TargetDocuments): UserPF2e | undefined => {
            return primaryPlayerOwner(target.actor) ?? undefined;
        },
    },
] as const satisfies EntryConvertor[];
