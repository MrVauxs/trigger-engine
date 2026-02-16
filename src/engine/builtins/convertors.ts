import { EntryConvertor } from "engine";
import { ItemPF2e, primaryPlayerOwner, R, UserPF2e } from "foundry-helpers";

const builtinsConvertors = [
    {
        output: "item",
        input: "target",
        convertToInput: (item: ItemPF2e): TargetDocuments | undefined => {
            const actor = item.actor;
            return actor ? { actor } : undefined;
        },
    },
    {
        output: "text",
        input: "number",
        convertToInput: (value: string): number => {
            const num = Number(value.trim() || "-1");
            return R.isNumber(num) ? num : -1;
        },
    },
    {
        output: "number",
        input: "text",
        convertToInput: (value: number): string => {
            return String(value);
        },
    },
    {
        output: "user",
        input: "target",
        convertToInput: (user: UserPF2e): TargetDocuments | undefined => {
            const actor = user.character;
            return actor ? { actor } : undefined;
        },
    },
    {
        output: "target",
        input: "user",
        convertToInput: (target: TargetDocuments, userContext): UserPF2e | undefined => {
            return !userContext.isGM && target.actor.testUserPermission(userContext, "OWNER")
                ? userContext
                : (primaryPlayerOwner(target.actor) ?? undefined);
        },
    },
] as const satisfies EntryConvertor[];

export { builtinsConvertors };
