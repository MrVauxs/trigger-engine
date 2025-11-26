import { getApplicationKey } from "engine";
import { R } from "module-helpers";
import { TriggerNode } from ".";

const TRIGGER_NODES: { [applicationKey: string]: Collection<typeof TriggerNode> } = {};

function registerNodes(moduleId: string, applicationId: string, ...Nodes: (typeof TriggerNode)[]) {
    const applicationKey = getApplicationKey(moduleId, applicationId);
    if (!applicationKey) return;

    for (const Node of Nodes) {
        if (R.isFunction(Node) && Node.prototype instanceof TriggerNode) {
            const application = (TRIGGER_NODES[applicationKey] ??= new Collection());
            application.set(Node.type, Node);
        }
    }

    console.log(TRIGGER_NODES);
}

function getTriggerNode(applicationKey: string, type: string) {
    return TRIGGER_NODES[applicationKey]?.get(type);
}

export { getTriggerNode, registerNodes };
