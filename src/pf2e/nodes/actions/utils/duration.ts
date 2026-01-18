import { TriggerNode } from "engine";
import { CustomEffectDuration, EffectExpiryType, R, TimeUnit, recordToSelectOptions } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

const fixedUnits = ["unlimited", "encounter"] as const;
const durationStates = ["timed", "fixed"] as const;

let DURATION_SCHEMAS: PF2eInputEntry[] | undefined;

function durationSchemas(): PF2eInputEntry[] {
    return (DURATION_SCHEMAS ??= [
        {
            key: "fixed",
            type: "text",
            group: "duration",
            state: "fixed",
            field: {
                type: "select",
                options: recordToSelectOptions(R.pick(CONFIG.PF2E.timeUnits, fixedUnits)),
                tooltip: false,
            },
        },
        {
            key: "origin",
            type: "target",
            group: "duration",
            state: "timed",
        },
        {
            key: "duration",
            type: "number",
            group: "duration",
            state: "timed",
            label: "PF2E.Time.Duration",
            field: {
                default: 1,
                min: 0,
            },
        },
        {
            key: "unit",
            type: "text",
            group: "duration",
            state: "timed",
            field: {
                type: "select",
                options: recordToSelectOptions(R.omit(CONFIG.PF2E.timeUnits, fixedUnits)),
                tooltip: false,
            },
        },
        {
            key: "expiry",
            type: "text",
            group: "duration",
            state: "timed",
            label: "PF2E.Item.Effect.Expiry.ExpiresOn",
            field: {
                type: "select",
                default: "turn-start",
                options: [
                    { value: "turn-start", label: "PF2E.Item.Effect.Expiry.StartOfTurn" },
                    { value: "turn-end", label: "PF2E.Item.Effect.Expiry.EndOfTurn" },
                    { value: "round-end", label: "PF2E.Item.Effect.Expiry.EndOfRound" },
                ],
            },
        },
    ]);
}

async function getDurationData(
    this: TriggerNode<any, DurationInputs, any, any, any, DurationState>,
): Promise<CustomEffectDuration> {
    if (this.state === "fixed") {
        return {
            expiry: null,
            unit: await this.getInputValue("fixed"),
            value: -1,
        };
    } else {
        return {
            expiry: await this.getInputValue("expiry"),
            unit: await this.getInputValue("unit"),
            value: await this.getInputValue("duration"),
            origin: await this.getInputValue("origin"),
        };
    }
}

type DurationState = (typeof durationStates)[number];

type DurationInputs = {
    duration: number;
    expiry: EffectExpiryType;
    fixed: (typeof fixedUnits)[number];
    origin?: TargetDocuments;
    unit: TimeUnit;
};

export { durationSchemas, durationStates, getDurationData };
export type { DurationInputs, DurationState };
