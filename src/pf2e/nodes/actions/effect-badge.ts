import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import {
    DoubleUuidInputs,
    doubleUuidSchemas,
    getDoubleUuidValue,
    getIconFromDoubleUuid,
    getLocalItemFromSourceUuid,
    PF2eInputEntry,
} from "pf2e";
import { EffectPF2e, findItemWithSourceId, ItemPF2e } from "module-helpers";

class EffectBadgeActionNode extends BaseActionNode<"out", Inputs, never, never, never, "item" | "uuid"> {
    static get type(): "effect-badge" {
        return "effect-badge";
    }

    static get tags(): string[] {
        return ["effect", "item"];
    }

    static get states(): string[] {
        return ["item", "uuid"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target", state: "uuid" },
            ...doubleUuidSchemas("uuid"),
            { key: "effect", type: "item", state: "item" },
            {
                key: "value",
                type: "number",
                field: { default: 1 },
            },
        ];
    }

    get title(): string | null {
        return getLocalItemFromSourceUuid.call(this)?.name ?? super.title;
    }

    get subtitle(): string | null {
        return getLocalItemFromSourceUuid.call(this) ? super.title : super.subtitle;
    }

    get icon(): IconObject | string | null {
        return getIconFromDoubleUuid.call(this, { unicode: "\uf559", fontWeight: "900" });
    }

    async _execute(): Promise<boolean> {
        const item = await this.getEffect();
        const value = await this.getInputValue("value");

        if (!value || !item?.isOfType("effect") || item.pack || item.isExpired) {
            return this.executeNext("out");
        }

        const badge = item.system.badge;

        if (badge?.type !== "counter") {
            return this.executeNext("out");
        }

        const { max, min } = badge;
        let newValue = badge.value + value;

        if (badge.loop) {
            // we keep looping until we reach a point between min & max
            while (newValue > max) {
                newValue = newValue - max + (min - 1);
            }
            while (newValue < min) {
                newValue = max - 1 + (value - min);
            }
        } else {
            // or we simply clamp
            newValue = Math.clamp(newValue, min, max);
        }

        if (newValue !== badge.value) {
            await item.update({ "system.badge.value": newValue });
        }

        return this.executeNext("out");
    }

    async getEffect(): Promise<EffectPF2e | null> {
        if (this.state === "item") {
            const item = await this.getInputValue("item");
            return item?.isOfType("effect") ? item : null;
        }

        const actor = (await this.getInputValue("target"))?.actor;
        if (!actor) return null;

        const uuid = await getDoubleUuidValue.call(this);
        return findItemWithSourceId(actor, uuid, "effect");
    }
}

type Inputs = DoubleUuidInputs & {
    item?: ItemPF2e;
    target?: TargetDocuments;
    value: number;
};

export { EffectBadgeActionNode };
