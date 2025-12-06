import { TriggerNode } from "engine";
import { BlueprintNode } from ".";
import { Blueprint, BlueprintLayers } from "..";

class BlueprintNodesLayer extends PIXI.Container {
    #nodes: Collection<BlueprintNode> = new Collection();

    get blueprint(): Blueprint {
        return this.parent.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get selected(): BlueprintNode[] {
        return this.#nodes.filter((node) => node.selected);
    }

    clearSelected() {
        for (const node of this.#nodes) {
            node.selected = false;
        }
    }

    selectIntersecting(selection: PIXI.Graphics) {
        const bounds = selection.getBounds();

        for (const node of this.#nodes) {
            node.selected = bounds.intersects(node.getBounds());
        }
    }

    add(node: TriggerNode, select: boolean): BlueprintNode {
        const exist = this.#nodes.get(node.id);
        if (exist) return exist;

        const _node = new BlueprintNode(node);

        this.#nodes.set(node.id, _node);
        this.addChild(_node);

        _node.draw();

        if (select) {
            this.clearSelected();
            _node.selected = true;
        }

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

interface BlueprintNodesLayer {
    parent: BlueprintLayers;
}

export { BlueprintNodesLayer };
