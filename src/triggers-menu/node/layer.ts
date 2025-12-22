import { ConnectionId, NodeDataSource, OpenTriggerNode } from "engine";
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

    delete(nodes: BlueprintNode[]) {
        const trigger = this.blueprint.trigger;
        if (!trigger) return;

        for (const node of nodes) {
            if (!node.selected) continue;

            node.eventMode = "none";
            trigger.deleteNode(node.id);
        }

        this.blueprint.draw(true);
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

    addFromSources(sources: NodeDataSource[]) {
        const trigger = this.blueprint.trigger;
        if (!trigger) return;

        const addedNodes: string[] = [];
        const replacementIds = R.pipe(
            sources,
            R.map((source) => source._id),
            R.fromKeys(() => foundry.utils.randomID())
        );

        for (const source of sources) {
            source._id = replacementIds[source._id];

            for (const category of ["ins", "inputs"] as const) {
                for (const entry of R.values(source[category])) {
                    if (entry?.connections?.length) {
                        entry.connections = entry.connections.map((connection): ConnectionId => {
                            const [nodeId, category, key] = R.split(connection, ":");
                            const newId = replacementIds[nodeId];
                            return `${newId}:${category}:${key}`;
                        });
                    }
                }
            }

            const newNode = trigger.addNode(source);

            if (newNode) {
                addedNodes.push(newNode.id);
            }
        }

        this.blueprint.draw(true);

        for (const nodeId of addedNodes) {
            const node = this.#nodes.get(nodeId);

            if (node) {
                node.bringToTop();
                node.selected = true;
            }
        }
    }

    clear() {
        this.removeAllListeners();

        this.#nodes.clear();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }

    #duplicateSelectedSources(nodes: BlueprintNode[]): NodeDataSource[] {
        const trigger = this.blueprint.trigger;
        if (!trigger) return [];

        const sources: NodeDataSource[] = [];
        const nodeIds = nodes.map((node) => node.id);
        // const replacementIds = R.pipe(
        //     nodes,
        //     R.map((node) => node.id),
        //     R.fromKeys(() => foundry.utils.randomID())
        // );

        for (const node of nodes) {
            const source = node.data.toObject();

            // source._id = replacementIds[source._id];

            source.position.x += 200;
            source.position.y += 100;

            for (const category of ["ins", "inputs"] as const) {
                for (const [key, entry] of R.entries(source[category])) {
                    if (entry?.connections?.length) {
                        entry.connections = R.pipe(
                            entry.connections,
                            R.filter((connection) => {
                                const nodeId = R.split(connection, ":")[0];
                                return R.isIncludedIn(nodeId, nodeIds);
                            })
                            // R.map((connection): ConnectionId | undefined => {
                            //     const [nodeId, category, key] = R.split(connection, ":");
                            //     const newId = replacementIds[nodeId];
                            //     return newId ? `${newId}:${category}:${key}` : undefined;
                            // }),
                            // R.filter(R.isTruthy)
                        );

                        if (!entry.connections) {
                            delete source[category][key];
                        }
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
