import { BaseActionNode } from "engine";
import { TimeUnit } from "foundry-helpers";
import { durationUnitsSchema, PF2eInputEntry } from "pf2e";

const TIME_UNITS: Record<TimeUnit, number> = {
    rounds: 6,
    minutes: 60,
    hours: 3600,
    days: 86400,
};

class MoveTimeActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "move-time" {
        return "move-time";
    }

    static get tags(): string[] {
        return ["resource"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            {
                key: "by",
                type: "number",
                field: { default: 10 },
            },
            durationUnitsSchema({ defaultValue: "minutes" }),
        ];
    }

    async _execute(): Promise<boolean> {
        const by = await this.getInputValue("by");

        if (by !== 0) {
            const unit = await this.getInputValue("unit");
            const value = by * TIME_UNITS[unit];

            await game.time.advance(value);
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    by: number;
    unit: TimeUnit;
};

export { MoveTimeActionNode };
