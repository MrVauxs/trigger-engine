import { TriggerNode } from "engine";

abstract class BuiltInTriggerNode<TOuts extends string | never = "out"> extends TriggerNode<TOuts> {}

export { BuiltInTriggerNode };
