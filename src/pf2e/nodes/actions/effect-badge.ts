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
            { key: "by", type: "number" },
        ];
    }

    get dynamicTitle(): string | null {
        const value = this.getLocalValue("by");
        return this.localize(value > 0 ? "titles.increase" : value < 0 ? "titles.decrease" : "title") as string;
    }

    get title(): string | null {
        return getLocalItemFromSourceUuid.call(this)?.name ?? this.dynamicTitle;
    }

    get subtitle(): string | null {
        return getLocalItemFromSourceUuid.call(this) ? this.dynamicTitle : super.subtitle;
    }

    get icon(): IconObject | string | null {
        return getIconFromDoubleUuid.call(this, { unicode: "\uf559", fontWeight: "900" });
    }

    async _execute(): Promise<boolean> {
        const item = await this.getEffect();
        const value = await this.getInputValue("by");

        if (!value || !item || item.pack) {
            return this.executeNext("out");
        }

        const badge = item.system.badge;

        // effect was expired, we don't increase it and we remove it if negative
        if (badge?.type !== "counter" || item.isExpired) {
            if (value < 0) {
                await item.delete();
            }
            return this.executeNext("out");
        }

        let newValue = badge.value + value;

        if (badge.loop) {
            // we keep looping until we reach a point between min & max
            while (newValue > badge.max) {
                newValue = newValue - badge.max + (badge.min - 1);
            }
            while (newValue < badge.min) {
                newValue = badge.max - 1 + (value - badge.min);
            }
        } else if (newValue < badge.min) {
            // we delete the effect when reaching lower than min
            await item.delete();
            return this.executeNext("out");
        } else {
            newValue = Math.min(newValue, badge.max);
        }

        if (newValue !== badge.value) {
            await item.update({ "system.badge.value": newValue });
        }

        return this.executeNext("out");
    }

    async getEffect(): Promise<EffectPF2e | null> {
        if (this.state === "item") {
            const item = await this.getInputValue("effect");
            return item?.isOfType("effect") ? item : null;
        }

        const actor = (await this.getInputValue("target"))?.actor;
        if (!actor) return null;

        const uuid = await getDoubleUuidValue.call(this);
        return findItemWithSourceId(actor, uuid, "effect");
    }
}

type Inputs = DoubleUuidInputs & {
    by: number;
    effect?: ItemPF2e;
    target?: TargetDocuments;
};

export { EffectBadgeActionNode };
