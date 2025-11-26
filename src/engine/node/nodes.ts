import { R } from "module-helpers";
import { TriggerNode } from ".";

const TRIGGER_NODES: Record<string, Collection<typeof TriggerNode>> = {
    "trigger-engine": new Collection(),
};

function registerNodes(moduleId: string, ...Nodes: (typeof TriggerNode)[]) {
    if (!R.isString(moduleId) || !game.modules.get(moduleId)?.active) return;

    const system = game.system.id;

    for (const Node of Nodes) {
        if (
            R.isFunction(Node) &&
            Node.prototype instanceof TriggerNode &&
            R.isIncludedIn(system, Node.systems)
        ) {
            const module = (TRIGGER_NODES[moduleId] ??= new Collection());
            module.set(Node.type, Node);
        }
    }

    console.log(TRIGGER_NODES);
}

function getTriggerNode(moduleId: string, type: string) {
    return TRIGGER_NODES[moduleId]?.get(type);
}

export { getTriggerNode, registerNodes };
