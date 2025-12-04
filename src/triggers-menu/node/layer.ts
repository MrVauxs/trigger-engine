import { TriggerNode } from "engine";
import { BlueprintNode } from ".";

class BlueprintNodesLayer extends PIXI.Container {
    #nodes: Collection<BlueprintNode> = new Collection();

    clearSelected() {
        for (const node of this.#nodes) {
            node.selected = false;
        }
    }

    selectNodes(selection: PIXI.Graphics) {
        const bounds = selection.getBounds();

        for (const node of this.#nodes) {
            if (bounds.intersects(node.getBounds())) {
                node.selected = true;
            }
        }
    }

    add(node: TriggerNode): BlueprintNode {
        const exist = this.#nodes.get(node.id);
        if (exist) return exist;

        const _node = new BlueprintNode(node);

        this.#nodes.set(node.id, _node);
        this.addChild(_node);

        _node.draw();

        return _node;
    }

    clear() {
        this.removeAllListeners();

        this.#nodes.clear();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }
}

export { BlueprintNodesLayer };
