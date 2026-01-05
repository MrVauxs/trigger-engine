import { TriggerHook } from "engine";

abstract class BuiltInTriggerHooks<
    TArgs extends Record<string, any> | undefined = undefined,
> extends TriggerHook<TArgs> {}

export { BuiltInTriggerHooks };
