import { ApplicationKey, BasesHook, RegionEventOptions, TriggerPath } from "engine";
import { R, RegionEventPF2e, localize } from "module-helpers";
import fields = foundry.data.fields;

const HOOKS: Collection<RegionHook, ApplicationKey> = new Collection();

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

        const [moduleId, applicationId, triggerId] = R.split(this.path, ":");
        const hook = HOOKS.get(`${moduleId}:${applicationId}`);
        const args: RegionEventOptions = {
            eventName: event.name,
            target: { actor, token },
        };

        hook?.executeTriggerEvent(triggerId, "region-event", args);
    }
}

class RegionHook extends BasesHook<RegionEventOptions> {
    static get type(): "region-hook" {
        return "region-hook";
    }

    get events(): ["region-event"] {
        return ["region-event"];
    }

    _enable(): void {
        HOOKS.set(this.applicationKey, this);
    }

    _disable(): void {
        HOOKS.delete(this.applicationKey);
    }
}

export { RegionHook, TriggerEngineRegionBehaviorType };
