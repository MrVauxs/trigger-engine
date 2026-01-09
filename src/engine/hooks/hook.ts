import { ApplicationKey, EmitableUserValue, TriggerNode, UserValue } from "engine";
import { MODULE } from "module-helpers";

class TriggerHook<TArgs extends any[] = []> {
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
        throw MODULE.Error("'events' accessor not implemented.");
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
        throw MODULE.Error("'_enable' method not implemented.");
    }

    /**
     * @abstract
     * This method is called during preparation before {@link TriggerHook#_enable} if is was previously enabled.
     */
    _disable() {
        throw MODULE.Error("'_disable' method not implemented.");
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
     * Convert the user value into one that is sent via websocket.
     */
    declare convertToEmitable: (userValue: UserValue) => UserValue | undefined;

    /**
     * @see {@link TriggerHook#convertToEmitable}
     */
    declare convertValuesToEmitable: (values: UserValue[]) => (EmitableUserValue | undefined)[];

    /**
     * Execute all triggers that have this event.
     *
     * @param userId the context the trigger should have.
     * @param event the name of the event to execute.
     * @param args the arguments to pass to the {@link TriggerNode#_execute} function.
     */
    declare executeEvent: (userId: string, event: this["events"][number], ...args: TArgs) => Promise<void>;

    /**
     * @see {@link TriggerHook#executeEvent}
     *
     * Execute the event of a specific trigger.
     *
     * @param triggerId the id of the trigger belonging to the same application.
     */
    declare executeTriggerEvent: (
        userId: string,
        triggerId: string,
        event: this["events"][number],
        ...args: TArgs
    ) => Promise<void>;

    /**
     * Have the active GM execute the trigger instead.
     * The executed trigger user context will be the user that called this function.
     */
    declare executeTriggerEventAsGM: (
        triggerIdOrPath: string,
        eventName: string,
        args?: Record<string, any>,
    ) => Promise<unknown>;

    /**
     * This is used to validate values provided by users at runtime.
     */
    declare parseUserValue: (userValue: UserValue, withType?: boolean) => boolean;

    /**
     * @see {@link TriggerHook#validateUserValue}
     *
     * Parse & filter an array of user values.
     */
    declare parseUserValues: (values: UserValue[], withType?: boolean) => any[];
}

export { TriggerHook };
