import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import {
    ActorPF2e,
    ItemPF2e,
    R,
    SaveType,
    Statistic,
    StatisticRollParameters,
    ZeroToThree,
    parseInlineParams,
    splitListString,
} from "module-helpers";
import {
    PF2eInputEntry,
    PF2eOutputEntry,
    RollDataInputs,
    getRollData,
    getTargetDC,
    getValueDC,
    rollDataSchemas,
} from "pf2e";

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
            { key: "origin", type: "target" },
            { key: "item", type: "item" },
            { key: "private", type: "boolean" },
            // save data
            {
                key: "save",
                type: "text",
                group: "save",
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
                group: "save",
                state: "value",
                field: { default: 15, min: 0 },
            },
            { key: "against", type: "text", group: "save", state: "target" },
            { key: "adjustment", type: "number", group: "save", state: "target" },
            { key: "basic", type: "boolean", group: "save", state: ["value", "target"] },
            {
                key: "index",
                type: "number",
                group: "save",
                state: "item",
                field: { default: 1, min: 1 },
            },
            // roll data
            ...rollDataSchemas(),
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "outcome", type: "outcome" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf6cf" };
    }

    async _execute(): Promise<boolean> {
        const target = await this.getInputValue("target");

        if (!target) {
            return this.executeNext("out");
        }

        const item = await this.getInputValue("item");
        const origin = (await this.getInputValue("origin"))?.actor;
        const isPrivate = await this.getInputValue("private");
        const rollOptions = item?.isOfType("action", "feat") ? [`target:action:slug:${item.slug}`] : undefined;
        // const options = splitListString(await this.getInputValue("options"));
        // const traits = splitListString(await this.getInputValue("traits"));

        const fortitude = target.actor.saves?.fortitude ?? origin?.saves?.fortitude;
        const StatisticCls = fortitude?.constructor as typeof Statistic | undefined;

        // const note = (await this.getInputValue("note"))
        //     .replace(/\n/gm, "")
        //     .replace(/<p>/gm, "")
        //     .replace(/<\/p>/gm, " ")
        //     .trim();

        const rollArgs: StatisticRollParameters = {
            dc: { value: 0, scope: "check" },
            origin: origin,
            item: item as ItemPF2e<ActorPF2e>,
            rollMode: isPrivate ? "blindroll" : "publicroll",
            skipDialog: true,
        };

        let isBasic: boolean = false;
        let statistic: Statistic | null = null;
        let extraOptions: string[] = [];
        let extraTraits: string[] = [];

        state: if (this.state === "item") {
            if (!item) break state;

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

            if (!rawParams?.type) break state;

            isBasic = "basic" in rawParams;
            statistic = target.actor.getStatistic(rawParams.type);

            const against = rawParams.against?.trim() || rawParams.defense?.trim() || null;

            if (against) {
                const adjustment = Number(rawParams.adjustment || "0");
                const dc = getTargetDC(origin, rollOptions, against, adjustment);

                if (dc) {
                    rollArgs.dc = dc;
                }
            } else {
                const value = Number(rawParams.dc?.trim()) || 0;
                const dc = getValueDC(StatisticCls, origin, item, rollOptions, value);

                rollArgs.dc = dc ?? { value, scope: "check" };
            }

            extraOptions = splitListString(rawParams.options ?? "");
            extraTraits = splitListString(rawParams.traits ?? "");

            if (rawParams.overrideTraits && rawParams.overrideTraits?.trim()?.toLowerCase() !== "true") {
                extraTraits.push(...splitListString(rawParams.overrideTraits));
            }
        } else {
            const save = await this.getInputValue("save");
            statistic = target.actor.getStatistic(save);

            if (this.state === "value") {
                const value = await this.getInputValue("value");
                const dc = getValueDC(StatisticCls, origin, item, rollOptions, value);

                isBasic = await this.getInputValue("basic");
                rollArgs.dc = dc ?? { value, scope: "check" };
            } else if (this.state === "target") {
                const against = await this.getInputValue("against");
                const adjustment = await this.getInputValue("adjustment");
                const dc = getTargetDC(origin, rollOptions, against, adjustment);

                if (dc) {
                    isBasic = await this.getInputValue("basic");
                    rollArgs.dc = dc;
                }
            }
        }

        if (!statistic) {
            return this.executeNext("out");
        }

        const rollData = await getRollData.call(this, { extraOptions, extraTraits, isBasic });

        rollArgs.extraRollNotes = rollData.extraRollNotes;
        rollArgs.extraRollOptions = rollData.extraRollOptions;

        const rolled = await statistic.roll(rollArgs);

        this.setOutputValue("outcome", rolled?.degreeOfSuccess);

        return this.executeNext("out");
    }
}

type Inputs = RollDataInputs & {
    adjustment: number;
    against: string;
    basic: boolean;
    index: number;
    item?: ItemPF2e;
    origin?: TargetDocuments;
    private: boolean;
    save: SaveType;
    target?: TargetDocuments;
    value: number;
};

type Outputs = {
    outcome: Maybe<ZeroToThree>;
};

export { RollSaveActionNode };
