import { TriggerHook } from "engine";

abstract class BasesHook<TArgs extends Record<string, any>> extends TriggerHook<[TArgs]> {}

export { BasesHook };
