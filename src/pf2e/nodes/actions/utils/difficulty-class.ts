import { ActorPF2e, CheckDC, ItemPF2e, ModifierPF2e, Statistic, extractModifierAdjustments } from "module-helpers";

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

export { getTargetDC, getValueDC };
