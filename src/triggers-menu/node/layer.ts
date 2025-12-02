import { TriggerNode } from "engine";
import { BlueprintNode } from ".";

class BlueprintNodesLayer extends PIXI.Container {
    #nodes: Collection<BlueprintNode> = new Collection();

    add(node: TriggerNode): BlueprintNode {
        const exist = this.#nodes.get(node.id);
        if (exist) return exist;

        const _node = new BlueprintNode(node);

        this.#nodes.set(node.id, _node);
        this.addChild(_node);

        _node.draw();

        return _node;
    }
}

export { BlueprintNodesLayer };
