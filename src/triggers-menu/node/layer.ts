import { OpenTriggerNode } from "engine";
import { BaseBlueprintEntry, BlueprintNode, EntryId } from ".";
import { Blueprint, BlueprintLayers } from "..";
import { R } from "module-helpers";

class BlueprintNodesLayer extends PIXI.Container<BlueprintNode> {
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

    get(id: string): BlueprintNode | undefined {
        return this.#nodes.get(id);
    }

    getAtPosition({ x, y }: Point): BlueprintNode | undefined {
        const nodes = this.children;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];

            if (node.getBounds().contains(x, y)) {
                return node;
            }
        }
    }

    getEntryFromId(id: EntryId): BaseBlueprintEntry | undefined {
        const [nodeId, category, key] = R.split(id, ":");
        return this.get(nodeId)?.[category].get(key);
    }

    selectIntersecting(selection: PIXI.Graphics) {
        const bounds = selection.getBounds();

        for (const node of this.#nodes) {
            node.selected = bounds.intersects(node.getBounds());
        }
    }

    add(node: OpenTriggerNode, select: boolean): BlueprintNode {
        const exist = this.#nodes.get(node.id);
        if (exist) return exist;

        const _node = new BlueprintNode(node);

        this.#nodes.set(node.id, _node);
        this.addChild(_node);

        _node.initialize();
        _node.draw();

        if (select) {
            this.clearSelected();
            _node.selected = true;
        }

        return _node;
    }

    deleteSelected() {
        for (const node of this.#nodes) {
            if (!node.selected) continue;

            this.blueprint.trigger?.deleteNode(node.id);
            this.#nodes.delete(node.id);
            this.removeChild(node);

            node.eventMode = "none";
            node.destroy(true);
        }

        this.blueprint.draw(true);
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
