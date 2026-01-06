import { ApplicationKey, RegionEventOptions, TriggerHook, TriggerPath } from "engine";
import { localize, R, RegionEventPF2e } from "module-helpers";

const HOOKS: Collection<RegionHook, ApplicationKey> = new Collection();

class TriggerEngineRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
    declare path: TriggerPath;

    static defineSchema() {
        return {
            events: this._createEventsField({
                events: R.values(CONST.REGION_EVENTS).filter((event) => event.startsWith("token")),
            }),
            path: new foundry.data.fields.StringField({
                required: true,
                nullable: false,
                trim: true,
                initial: "",
                label: localize("builtins.region.path"),
                validate: (value) => R.isString(value) && R.split(value, ":").length === 3,
            }),
        };
    }

    protected override async _handleRegionEvent(event: RegionEventPF2e): Promise<void> {
        if (!("token" in event.data)) return;

        const token = event.data.token;
        const actor = token.actor;
        if (!actor) return;

        const [moduleId, applicationId, triggerId] = R.split(this.path, ":");
        const hook = HOOKS.get(`${moduleId}:${applicationId}`);
        const args: RegionEventOptions = {
            event: event.name,
            target: { actor, token },
        };

        hook?.executeTriggerEvent(triggerId, "region-event", args);
    }
}

class RegionHook extends TriggerHook<RegionEventOptions> {
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
