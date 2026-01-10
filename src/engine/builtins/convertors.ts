import { EntryConvertor } from "engine";
import { ItemPF2e, UserPF2e, primaryPlayerOwner } from "module-helpers";

export default [
    {
        input: "text",
        output: "item",
        convertToInput: (value: ItemPF2e): string => {
            return value.uuid;
        },
    },
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
        convertToInput: (target: TargetDocuments, userContext): UserPF2e | undefined => {
            return !userContext.isGM && target.actor.testUserPermission(userContext, "OWNER")
                ? userContext
                : (primaryPlayerOwner(target.actor) ?? undefined);
        },
    },
] as const satisfies EntryConvertor[];
