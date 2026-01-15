import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import {
    ActorPF2e,
    CheckDC,
    ItemPF2e,
    ModifierPF2e,
    R,
    SaveType,
    Statistic,
    ZeroToThree,
    extractModifierAdjustments,
    getExtraRollOptions,
} from "module-helpers";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class RollSaveActionNode extends BaseActionNode<"out", Inputs, Outputs, never, never, "value" | "target" | "item"> {
    static get type(): "roll-save" {
        return "roll-save";
    }

    static get tags(): string[] {
        return ["chat", "save"];
    }

    static get states(): string[] {
        return ["value", "target", "item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            {
                key: "save",
                type: "text",
                field: {
                    type: "select",
                    options: R.pipe(
                        CONFIG.PF2E.saves,
                        R.entries(),
                        R.map(([value, label]) => ({ value, label })),
                    ),
                },
            },
            { key: "basic", type: "boolean" },
            { key: "private", type: "boolean" },
            // source
            { key: "origin", type: "target", group: "source" },
            { key: "item", type: "item", group: "source" },
            // dc
            {
                key: "value",
                type: "number",
                group: "dc",
                state: "value",
                field: { default: 15, min: 0 },
            },
            { key: "against", type: "text", group: "dc", state: "target" },
            { key: "adjustment", type: "number", group: "dc", state: "target" },
            {
                key: "index",
                type: "number",
                group: "dc",
                state: "item",
                field: { default: 1, min: 1 },
            },
            // roll data
            { key: "options", type: "text", group: "roll" },
            { key: "traits", type: "text", group: "roll" },
            {
                key: "note",
                type: "text",
                group: "roll",
                field: { type: "enriched" },
            },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "outcome", type: "outcome" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf6cf" };
    }

    async _execute(): Promise<boolean> {
        const save = await this.getInputValue("save");
        const target = await this.getInputValue("target");
        const statistic = target?.actor.getStatistic(save);

        if (!target || !statistic) {
            return this.executeNext("out");
        }

        const origin = await this.getInputValue("origin");
        const item = await this.getInputValue("item");
        const rollOptions = item?.isOfType("action", "feat") ? [`target:action:slug:${item.slug}`] : undefined;

        let dc: CheckDC | undefined;

        if (this.state === "value") {
            const StatisticCls = origin?.actor.saves?.will?.constructor as typeof Statistic;
            const value = await this.getInputValue("value");

            if (origin && StatisticCls) {
                const domains = ["saving-throw", "all"];

                const modifiers = [
                    new game.pf2e.Modifier({
                        slug: "base",
                        label: "PF2E.ModifierTitle",
                        modifier: value - 10,
                        adjustments: extractModifierAdjustments(
                            origin.actor.synthetics.modifierAdjustments,
                            domains,
                            "base",
                        ),
                    }),
                ];

                const statistic = new StatisticCls(origin.actor, {
                    slug: "fake",
                    label: game.i18n.localize("PF2E.SavingThrow"),
                    domains,
                    modifiers,
                    rollOptions,
                    check: {
                        type: "saving-throw",
                    },
                });

                dc = {
                    label: item ? game.i18n.format("PF2E.InlineCheck.DCWithName", { name: item.name }) : undefined,
                    scope: "check",
                    statistic: statistic.dc,
                    value: statistic.dc.value,
                };
            } else {
                dc = { value, scope: "check" };
            }
        } else if (this.state === "target") {
            const against = await this.getInputValue("against");
            const statistic = origin?.actor.getStatistic(against);

            if (origin && statistic) {
                const adjustment = await this.getInputValue("adjustment");
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
                const label =
                    defenseStat.dc.label ??
                    game.i18n.format("PF2E.InlineCheck.DCWithName", { name: defenseStat.label });

                dc = {
                    label,
                    scope: "check",
                    statistic: defenseStat.dc,
                    value: defenseStat.dc.value,
                };
            } else {
                dc = { value: 0, scope: "check" };
            }
        } else if (this.state === "item") {
            if (item) {
                const index = await this.getInputValue("index");
                const description = item.description;
                const regex = /@Check\[(?=.*\b(will|reflex|fortitude)\b).*?(dc:(?<dc>\d+)).*?\]/gm;

                let count = 0;
                let value: number = 0;
                let match: RegExpExecArray | null = null;

                while ((match = regex.exec(description)) !== null) {
                    const dc = Number(match.groups?.dc);

                    if (!value) {
                        value = dc;
                    }

                    if (++count >= index) {
                        value = dc;
                        break;
                    }
                }

                dc = {
                    label: game.i18n.format("PF2E.InlineCheck.DCWithName", { name: item.name }),
                    scope: "check",
                    value,
                };
            } else {
                dc = { value: 0, scope: "check" };
            }
        }

        const isBasic = await this.getInputValue("basic");
        const isPrivate = await this.getInputValue("private");
        const options = await this.getInputValue("options");
        const traits = await this.getInputValue("traits");
        const note = (await this.getInputValue("note"))
            .replace(/\n/gm, "")
            .replace(/<p>/gm, "")
            .replace(/<\/p>/gm, " ")
            .trim();

        const rolled = await statistic.roll({
            dc,
            origin: origin?.actor,
            item: item as ItemPF2e<ActorPF2e>,
            extraRollOptions: getExtraRollOptions({ options, traits }, isBasic),
            rollMode: isPrivate ? "blindroll" : "publicroll",
            skipDialog: true,
            extraRollNotes: note ? [{ text: note, selector: "all" }] : [],
        });

        this.setOutputValue("outcome", rolled?.degreeOfSuccess);

        return this.executeNext("out");
    }
}

type Inputs = {
    adjustment: number;
    against: string;
    basic: boolean;
    index: number;
    item?: ItemPF2e;
    note: string;
    options: string;
    origin?: TargetDocuments;
    private: boolean;
    save: SaveType;
    target?: TargetDocuments;
    traits: string;
    value: number;
};

type Outputs = {
    outcome: Maybe<ZeroToThree>;
};

export { RollSaveActionNode };
