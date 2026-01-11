import { BaseBuiltinsHook, RegionEventOptions, TriggerApplication, TriggerPath } from "engine";
import { R, RegionEventPF2e, localize } from "module-helpers";
import fields = foundry.data.fields;

class TriggerEngineRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
    declare gm: boolean;
    declare path: TriggerPath;

    static defineSchema() {
        return {
            events: this._createEventsField({
                events: R.values(CONST.REGION_EVENTS).filter((event) => event.startsWith("token")),
            }),
            gm: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: true,
                label: localize("builtins.region.gm"),
            }),
            path: new fields.StringField({
                required: true,
                nullable: false,
                trim: true,
                initial: "",
                label: localize("builtins.region.path"),
                validate: (value) => R.isString(value) && R.split(value, ":").length === 3,
            }),
        };
    }

    async _handleRegionEvent(event: RegionEventPF2e): Promise<void> {
        if (!("token" in event.data) || (this.gm && !game.user.isActiveGM)) return;

        const token = event.data.token;
        const actor = token.actor;
        if (!actor) return;

        const args: RegionEventOptions = {
            eventName: event.name,
            target: { actor, token },
        };

        TriggerApplication.executeTriggerEvent(game.userId, this.path, "region-event", args);
    }
}

class RegionHook extends BaseBuiltinsHook<RegionEventOptions> {
    static get type(): "region-hook" {
        return "region-hook";
    }

    get events(): ["region-event"] {
        return ["region-event"];
    }

    _enable(): void {}

    _disable(): void {}
}

export { RegionHook, TriggerEngineRegionBehaviorType };
