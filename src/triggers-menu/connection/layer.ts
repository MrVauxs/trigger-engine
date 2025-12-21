import { subtractPoint } from "module-helpers";
import {
    BaseBlueprintEntry,
    Blueprint,
    BlueprintConnection,
    BlueprintLayers,
    drawCurvedLine,
    EntryId,
} from "triggers-menu";

class BlueprintConnectionsLayer extends PIXI.Container {
    #blueprint: Blueprint;
    #connections = new Collection<BlueprintConnection, TwoWaysEntryId>();
    #connector?: FreeConnector;

    constructor(blueprint: Blueprint) {
        super();

        this.#blueprint = blueprint;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    clear() {
        this.#connections.clear();
        this.#terminateConnection();

        this.removeAllListeners();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }

    start(event: PIXI.FederatedPointerEvent, entry: BaseBlueprintEntry) {
        this.#terminateConnection();

        this.blueprint.nodes.interactiveChildren = false;

        const alreadyConnected = entry.isConnected;

        if (!alreadyConnected) {
            entry.redrawConnector(true);
        }

        this.#connector = this.addChild(new PIXI.Graphics() as FreeConnector);
        this.#connector.origin = {
            color: entry.color,
            entry,
            position: this.fromPoint(entry.connectorCenter),
            wasConnected: alreadyConnected,
        };

        this.stage.on("pointermove", this.#onPointerMove, this);
        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#terminateConnection, this);
    }

    fromPoint(point: Point): Point {
        return subtractPoint(this.blueprint.unscalePoint(point), this.parent);
    }

    refreshConnection(entry: BaseBlueprintEntry) {
        for (const connection of this.#connections) {
            if (connection.hasEntry(entry)) {
                connection.draw();
            }
        }
    }

    add(origin: EntryId, target: EntryId) {
        const connection = this.addChild(new BlueprintConnection(origin, target));

        connection.draw();

        this.#connections.set(`${origin}-${target}`, connection);
        this.#connections.set(`${target}-${origin}`, connection);
    }

    #onPointerMove(event: PIXI.FederatedPointerEvent) {
        const connector = this.#connector;
        if (!connector) return;

        const origin = connector.origin.position;
        const target = this.fromPoint(event.global);

        connector.clear();
        drawCurvedLine(connector, origin, target, [connector.origin.color]);
    }

    async #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const connector = this.#connector;
        if (!connector) return;

        const originEntry = connector.origin.entry as BaseBlueprintEntry;
        const originNode = originEntry.node;
        const { x, y } = event.global;

        const targetNode = this.blueprint.nodes.getAtPosition({ x, y });

        if (!targetNode || targetNode === originNode) {
            if (!targetNode) {
                const result = await this.blueprint.openNodesMenu(event, originEntry);
                const newNode = result?.node;

                if (newNode) {
                    connector.origin.entry = undefined;

                    const targetEntry = result.selectedId
                        ? this.blueprint.nodes.getEntryFromId(result.selectedId)
                        : undefined;

                    if (targetEntry) {
                        const { x, y } = this.blueprint.unscalePoint(targetEntry.connectorOffset);
                        newNode.setPosition(newNode.x - x, newNode.y - y);
                    }
                }
            }

            this.#terminateConnection();
            return;
        }

        const targetEntry = targetNode.entries.find((entry) => entry.getBounds().contains(x, y));

        if (targetEntry?.canConnectTo(originEntry)) {
            connector.origin.entry = undefined;

            const [inputNode, inputEntry, outputNode, outputEntry] = originEntry.isInput
                ? [originNode, originEntry, targetNode, targetEntry]
                : [targetNode, targetEntry, originNode, originEntry];

            inputNode.addConnection(inputEntry.preciseCategory, inputEntry.key, outputEntry.id);

            this.blueprint.trigger?.addComputedConnections(inputEntry.id, outputEntry.id);
            this.add(inputEntry.id, outputEntry.id);

            inputNode.draw();
            outputNode.draw();
        }

        this.#terminateConnection();
    }

    #terminateConnection() {
        if (!this.#connector) return;

        this.stage.off("pointermove", this.#onPointerMove, this);
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#terminateConnection, this);

        const { entry, wasConnected } = this.#connector.origin;

        if (entry && !wasConnected) {
            entry.redrawConnector(false);
        }

        this.removeChild(this.#connector);
        this.#connector.destroy(true);
        this.#connector = undefined;

        this.blueprint.nodes.interactiveChildren = true;
    }
}

interface BlueprintConnectionsLayer {
    parent: BlueprintLayers;
}

type TwoWaysEntryId = `${EntryId}-${EntryId}`;

type FreeConnector = PIXI.Graphics & {
    origin: {
        color: ColorSource;
        entry?: BaseBlueprintEntry;
        position: Point;
        wasConnected: boolean;
    };
};

export { BlueprintConnectionsLayer };
export type { TwoWaysEntryId };
