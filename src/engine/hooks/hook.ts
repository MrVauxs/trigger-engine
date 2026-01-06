import { ApplicationKey } from "engine";
import { MODULE } from "module-helpers";

class TriggerHook<TArgs extends Record<string, any> | never = never> {
    //////////////////////////////
    // ABSTRACT ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * List of event types that this hook can execute.
     *
     * @see {@link TriggerHook#_enable}.
     */
    get events(): string[] {
        throw MODULE.Error("Method not implemented.");
    }

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    /**
     * List of non-event node types that this hook has relation with.
     */
    get otherNodes(): string[] {
        return [];
    }

    //////////////////////////////
    // IMMUTABLE ACCESSORS
    //////////////////////////////

    /**
     * The internal key for the parent application.
     */
    declare readonly applicationKey: ApplicationKey;

    //////////////////////////////
    // ABSTRACT METHODS
    //////////////////////////////

    /**
     * @abstract
     * This method is called if at least one trigger can be executed by this hook.
     */
    _enable() {
        throw MODULE.Error("Method not implemented.");
    }

    /**
     * @abstract
     * This method is called during preparation before {@link TriggerHook#_enable} if is was previously enabled.
     */
    _disable() {
        throw MODULE.Error("Method not implemented.");
    }

    //////////////////////////////
    // METHODS
    //////////////////////////////

    /**
     * This method is called if no trigger can be executed by this hook but some {@link TriggerHook#otherNodes} exist.
     *
     * This is useful if you need to have some background process running for exceptional nodes.
     */
    _listen() {}

    //////////////////////////////
    // IMMUTABLE METHODS
    //////////////////////////////

    /**
     * Execute all triggers that have this event.
     */
    declare executeEvent: (event: this["events"][number], args?: TArgs) => Promise<void>;

    /**
     * Execute the event of a specific trigger.
     */
    declare executeTriggerEvent: (triggerId: string, event: this["events"][number], args?: TArgs) => Promise<void>;
}

export { TriggerHook };
