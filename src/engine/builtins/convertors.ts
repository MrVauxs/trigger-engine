import { EntryConvertor } from "engine";
import { ItemPF2e, primaryPlayerOwner, R, UserPF2e } from "foundry-helpers";

const TEXT_STRING_REGEX = /(?<x>[0-9\.]+)\s*[:,|_\/-]\s*(?<y>[0-9\.]+)/;

const builtinsConvertors = [
    {
        output: "boolean",
        input: "number",
        convertToInput: (value: boolean): number => {
            return Number(value);
        },
    },
    {
        output: "item",
        input: "target",
        convertToInput: (value: ItemPF2e): TargetDocuments | undefined => {
            const actor = value.actor;
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
        convertToInput: (value: UserPF2e): TargetDocuments | undefined => {
            const actor = value.character;
            return actor ? { actor } : undefined;
        },
    },
    {
        output: "target",
        input: "user",
        convertToInput: (value: TargetDocuments, userContext): UserPF2e | undefined => {
            return !userContext.isGM && value.actor.testUserPermission(userContext, "OWNER")
                ? userContext
                : (primaryPlayerOwner(value.actor) ?? undefined);
        },
    },
    {
        output: "number",
        input: "point",
        convertToInput: (value: number): Point | undefined => {
            return { x: value, y: value };
        },
    },
    {
        output: "text",
        input: "point",
        convertToInput: (value: string): Point | undefined => {
            const match = TEXT_STRING_REGEX.exec(value);
            if (!match?.groups) return;

            return {
                x: Number(match.groups.x),
                y: Number(match.groups.y),
            };
        },
    },
] as const satisfies EntryConvertor[];

export { builtinsConvertors };
