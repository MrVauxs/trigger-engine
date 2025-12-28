import { NodeDataOutput, OpenTriggerNode, OPPOSITE_CONNECTION_CATEGORY } from "engine";
import { info, R } from "module-helpers";
import { BaseBlueprintEntry, BlueprintNode, EntryId } from ".";
import { Blueprint, BlueprintLayers } from "..";

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

    filter(fn: (node: BlueprintNode) => boolean) {
        return this.#nodes.filter(fn);
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

    selectNodes(ids: string[]) {
        for (const nodeId of ids) {
            const node = this.#nodes.get(nodeId);

            if (node) {
                node.selected = true;
            }
        }
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

    delete(nodes: BlueprintNode[]) {
        const trigger = this.blueprint.trigger;
        if (!trigger) return;

        for (const node of nodes) {
            if (!node.selected) continue;

            node.eventMode = "none";
            trigger.deleteNode(node.id);
        }

        this.blueprint.draw({ forceComputeConnections: true, renderApplication: true });
    }

    copySelected(nodes: BlueprintNode[]) {
        const sources = this.#duplicateSelectedSources(nodes);
        if (!sources.length) return;

        const str = JSON.stringify(sources);

        game.clipboard.copyPlainText(str);
        info("blueprint.node.copy.copied");
    }

    duplicateSelected(nodes: BlueprintNode[]) {
        const sources = this.#duplicateSelectedSources(nodes);
        if (!sources.length) return;

        this.addFromSources(sources);
    }

    addFromSources(sources: NodeDataOutput[]) {
        const trigger = this.blueprint.trigger;
        if (!trigger) return;

        const addedNodes: string[] = [];
        const replacementIds = R.pipe(
            sources,
            R.map((source) => source.id),
            R.fromKeys(() => foundry.utils.randomID())
        );

        for (const source of sources) {
            source.id = replacementIds[source.id];

            for (const category of OPPOSITE_CONNECTION_CATEGORY) {
                for (const entry of R.values(source[category])) {
                    if (!entry.connections) continue;

                    entry.connections = R.mapKeys(entry.connections, (connectionId) => {
                        const [nodeId, category, key] = R.split(connectionId, ":");
                        const newId = replacementIds[nodeId];
                        return `${newId}:${category}:${key}`;
                    });
                }
            }

            const newNode = trigger.addNode(source);

            if (newNode) {
                addedNodes.push(newNode.id);
            }
        }

        this.blueprint.draw({
            forceComputeConnections: true,
            renderApplication: true,
            selectNodes: addedNodes,
        });
    }

    clear() {
        this.removeAllListeners();

        this.#nodes.clear();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }

    #duplicateSelectedSources(nodes: BlueprintNode[]): NodeDataOutput[] {
        const trigger = this.blueprint.trigger;
        if (!trigger) return [];

        const sources: NodeDataOutput[] = [];
        const nodeIds = nodes.map((node) => node.id);

        for (const node of nodes) {
            if (!node.isDuplicable) continue;

            const source = node.data.toObject();

            source.position.x += 200;
            source.position.y += 100;

            for (const category of OPPOSITE_CONNECTION_CATEGORY) {
                for (const [key, entry] of R.entries(source[category])) {
                    if (!entry?.connections) continue;

                    entry.connections = R.pickBy(entry.connections, (value, connectionId) => {
                        const nodeId = R.split(connectionId, ":")[0];
                        return R.isIncludedIn(nodeId, nodeIds);
                    });

                    if (foundry.utils.isEmpty(entry.connections)) {
                        delete source[category][key];
                    }
                }
            }

            sources.push(source);
        }

        return sources;
    }
}

interface BlueprintNodesLayer {
    parent: BlueprintLayers;
}

export { BlueprintNodesLayer };
