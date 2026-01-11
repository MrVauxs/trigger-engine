import { TriggerHook } from "engine";

abstract class BaseBuiltinsHook<TArgs extends Record<string, any>> extends TriggerHook<[TArgs]> {}

export { BaseBuiltinsHook };
