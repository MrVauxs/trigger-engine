import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { calculateTimeIncrement, R, TimeUnit } from "foundry-helpers";
import { durationUnitsSchema, PF2eInputEntry } from "pf2e";

const THRESHOLD_TYPES = ["Advance", "Retract"] as const;

const TIME_UNITS: Record<TimeUnit, number> = {
    rounds: 6,
    minutes: 60,
    hours: 3600,
    days: 86400,
};

class MoveTimeActionNode extends BaseActionNode<"out", Inputs, never, never, never, "unit" | "threshold"> {
    static get type(): "move-time" {
        return "move-time";
    }

    static get tags(): string[] {
        return ["resource"];
    }

    static get states(): string[] {
        return ["unit", "threshold"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        const thresholds = R.flatMap(THRESHOLD_TYPES, (section) => {
            return R.pipe(
                CONFIG.PF2E.worldClock.Button.TimeOfDay[section],
                R.entries(),
                R.map(([value, label]) => {
                    return { value: `${section}-${value.toLowerCase()}`, label } as const;
                }),
            );
        });

        return [
            {
                key: "by",
                type: "number",
                state: "unit",
                field: { default: 10 },
            },
            durationUnitsSchema({ defaultValue: "minutes", state: "unit" }),
            {
                key: "threshold",
                type: "text",
                state: "threshold",
                tooltip: false,
                field: { type: "select", options: thresholds },
            },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\ue134" };
    }

    async _execute(): Promise<boolean> {
        if (this.state === "threshold") {
            await this.#executeThreshold();
        } else {
            await this.#executeUnit();
        }

        return this.executeNext("out");
    }

    async #executeUnit() {
        const by = await this.getInputValue("by");

        if (by !== 0) {
            const unit = await this.getInputValue("unit");
            const value = by * TIME_UNITS[unit];

            await game.time.advance(value);
        }
    }

    async #executeThreshold() {
        const threshold = await this.getInputValue("threshold");
        const [type, interval] = R.split(threshold, "-") as [ThresholdType, string];
        const increment = calculateTimeIncrement(interval, type === "Advance" ? "+" : "-");

        await game.time.advance(increment);
    }
}

type Inputs = {
    by: number;
    threshold: `${ThresholdType}-${string}`;
    unit: TimeUnit;
};

type ThresholdType = (typeof THRESHOLD_TYPES)[number];

export { MoveTimeActionNode };
