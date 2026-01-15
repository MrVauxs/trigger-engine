import { TriggerNode } from "engine";
import {
    ActorPF2e,
    CheckDC,
    ItemPF2e,
    ModifierPF2e,
    R,
    SAVE_TYPES,
    SaveType,
    Statistic,
    extractModifierAdjustments,
    localizePath,
    parseInlineParams,
    splitListString,
} from "module-helpers";
import { PF2eInputEntry } from "pf2e";

const dcStates = ["value", "target", "item-description"] as const;

function dcLocalizePath(...path: string[]): string {
    return localizePath("pf2e-trigger.shared.difficulty-class", ...path);
}

function dcSchemas(group: string = "save"): PF2eInputEntry[] {
    return [
        {
            key: "save",
            type: "text",
            group,
            state: ["value", "target"],
            field: {
                type: "select",
                options: R.pipe(
                    CONFIG.PF2E.saves,
                    R.entries(),
                    R.map(([value, label]) => ({ value, label })),
                ),
            },
        },
        {
            key: "value",
            type: "number",
            group,
            state: "value",
            field: { default: 15, min: 0 },
        },
        { key: "against", type: "text", group, label: dcLocalizePath("against.title"), state: "target" },
        {
            key: "adjustment",
            type: "number",
            group,
            label: dcLocalizePath("adjustment.title"),
            state: "target",
        },
        { key: "basic", type: "boolean", group, state: ["value", "target"] },
        {
            key: "index",
            type: "number",
            group,
            label: dcLocalizePath("index.title"),
            state: "item-description",
            field: { default: 1, min: 1 },
        },
    ];
}

function getValueDC(
    StatisticCls: typeof Statistic | undefined,
    origin: ActorPF2e | undefined,
    item: ItemPF2e | undefined,
    rollOptions: string[] | undefined,
    value: number,
): CheckDC | undefined {
    if (!origin || !StatisticCls) return;

    const domains = ["saving-throw", "all"];

    const modifiers = [
        new game.pf2e.Modifier({
            slug: "base",
            label: "PF2E.ModifierTitle",
            modifier: value - 10,
            adjustments: extractModifierAdjustments(origin.synthetics.modifierAdjustments, domains, "base"),
        }),
    ];

    const statistic = new StatisticCls(origin, {
        slug: "fake",
        label: game.i18n.localize("PF2E.SavingThrow"),
        domains,
        modifiers,
        rollOptions,
        check: {
            type: "saving-throw",
        },
    });

    return {
        label: item ? game.i18n.format("PF2E.InlineCheck.DCWithName", { name: item.name }) : undefined,
        scope: "check",
        statistic: statistic.dc,
        value: statistic.dc.value,
    };
}

function getTargetDC(
    origin: ActorPF2e | undefined,
    rollOptions: string[] | undefined,
    against: string,
    adjustment: number,
): CheckDC | undefined {
    const statistic = origin?.getStatistic(against);
    if (!statistic) return;

    const modifiers: ModifierPF2e[] = [];

    if (adjustment !== 0) {
        modifiers.push(
            new game.pf2e.Modifier({
                label: "PF2E.InlineCheck.DCAdjustment",
                modifier: adjustment,
            }),
        );
    }

    const defenseStat = statistic.clone({ modifiers, rollOptions });
    const label = defenseStat.dc.label ?? game.i18n.format("PF2E.InlineCheck.DCWithName", { name: defenseStat.label });

    return {
        label,
        scope: "check",
        statistic: defenseStat.dc,
        value: defenseStat.dc.value,
    };
}

async function getDcData(
    this: TriggerNode<any, DifficultyClassInputs, never, never, never, DifficultyClassState>,
    target: ActorPF2e | undefined,
    origin: ActorPF2e | undefined,
    item: ItemPF2e | undefined,
): Promise<DifficultyClassData | undefined> {
    const fortitude = target?.saves?.fortitude ?? origin?.saves?.fortitude;
    const StatisticCls = fortitude?.constructor as typeof Statistic | undefined;
    const rollOptions = item?.isOfType("action", "feat") ? [`target:action:slug:${item.slug}`] : undefined;

    if (this.state === "item-description") {
        if (!item) return;

        const index = await this.getInputValue("index");
        const description = item.description;
        const regex = /@Check\[(?=.*\b(will|reflex|fortitude)\b)([^\]]+)\]/gm;

        let count = 0;
        let match: RegExpExecArray | null = null;
        let rawParams: Record<string, string | undefined> | null = null;

        while ((match = regex.exec(description)) !== null) {
            if (++count >= index) {
                rawParams = parseInlineParams(match[2], { first: "type" });
                break;
            }
        }

        if (!rawParams?.type || !R.isIncludedIn(rawParams.type, SAVE_TYPES)) return;

        const args: DifficultyClassData = {
            dc: { value: 0, scope: "check" },
            isBasic: "basic" in rawParams,
            save: rawParams.type,
            statistic: target?.getStatistic(rawParams.type),
        };

        const against = rawParams.against?.trim() || rawParams.defense?.trim() || null;

        if (against) {
            const adjustment = Number(rawParams.adjustment || "0");
            const dc = getTargetDC(origin, rollOptions, against, adjustment);

            if (dc) {
                args.dc = dc;
            }
        } else {
            const value = Number(rawParams.dc?.trim()) || 0;
            const dc = getValueDC(StatisticCls, origin, item, rollOptions, value);

            args.dc = dc ?? { value, scope: "check" };
        }

        args.extraOptions = splitListString(rawParams.options ?? "");
        args.extraTraits = splitListString(rawParams.traits ?? "");

        if (rawParams.overrideTraits && rawParams.overrideTraits?.trim()?.toLowerCase() !== "true") {
            args.extraTraits.push(...splitListString(rawParams.overrideTraits));
        }

        return args;
    }

    const save = await this.getInputValue("save");
    const statistic = target?.getStatistic(save);

    if (this.state === "value") {
        const value = await this.getInputValue("value");
        const dc = getValueDC(StatisticCls, origin, item, rollOptions, value);

        return {
            dc: dc ?? { value, scope: "check" },
            isBasic: await this.getInputValue("basic"),
            save,
            statistic,
        };
    }

    if (this.state === "target") {
        const against = await this.getInputValue("against");
        const adjustment = await this.getInputValue("adjustment");
        const dc = getTargetDC(origin, rollOptions, against, adjustment);
        if (!dc) return;

        return {
            dc,
            isBasic: await this.getInputValue("basic"),
            save,
            statistic,
        };
    }
}

type DifficultyClassState = (typeof dcStates)[number];

type DifficultyClassData = {
    dc: CheckDC;
    extraOptions?: string[];
    extraTraits?: string[];
    isBasic: boolean;
    save: SaveType;
    statistic?: Statistic | null;
};

type DifficultyClassInputs = {
    adjustment: number;
    against: string;
    basic: boolean;
    index: number;
    save: SaveType;
    value: number;
};

export { dcSchemas, dcStates, getDcData, getTargetDC, getValueDC };
export type { DifficultyClassInputs, DifficultyClassState };
