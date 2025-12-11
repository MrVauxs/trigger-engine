import { TriggerNode } from "engine";

abstract class BuiltInTriggerNode extends TriggerNode {}

function isBuiltInNode(node: typeof TriggerNode): node is typeof BuiltInTriggerNode {
    return node.prototype instanceof BuiltInTriggerNode;
}

export { BuiltInTriggerNode, isBuiltInNode };
