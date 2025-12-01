import { NodeData, Trigger, TriggerNode } from "engine";

class BuiltInTriggerNode extends TriggerNode {
    constructor(parent: Trigger, data: NodeData) {
        data.builtin = true;

        super(parent, data);
    }
}

function isBuiltInNode(node: typeof TriggerNode): node is typeof BuiltInTriggerNode {
    return node.prototype instanceof BuiltInTriggerNode;
}

export { BuiltInTriggerNode, isBuiltInNode };
