import { ConnectionId } from "engine";
import { BaseBlueprintEntry, Blueprint, BlueprintLayers } from "triggers-menu";

class BlueprintConnectionsLayer extends PIXI.Container {
    #blueprint: Blueprint;
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
            position: this.parent.fromPoint(entry.connectorCenter),
            wasConnected: alreadyConnected,
        };

        this.stage.on("pointermove", this.#onPointerMove, this);
        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#terminateConnection, this);
    }

    #onPointerMove(event: PIXI.FederatedPointerEvent) {
        const connector = this.#connector;
        if (!connector) return;

        const origin = connector.origin.position;
        const target = this.parent.fromPoint(event.global);

        connector.clear();
        connector.moveTo(origin.x, origin.y);
        connector.lineStyle(6, connector.origin.color, 1, 0.5);
        connector.lineTo(target.x, target.y);
    }

    async #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const connector = this.#connector;
        if (!connector) return;

        const originEntry = connector.origin.entry as BaseBlueprintEntry;
        const originNode = originEntry.node;
        const { x, y } = this.parent.fromPoint(event.global);
        const targetNode = this.blueprint.nodes.getAtPosition({ x, y });

        if (!targetNode || targetNode === originNode) {
            if (!targetNode) {
                // TODO open nodes menu
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

            const category = inputEntry.preciseCategory as "ins" | "inputs";

            const connections = inputNode.getConnectionsFromEntry(inputEntry);
            connections.push(outputEntry.id as ConnectionId);

            inputNode.data.updateSource({
                [category]: {
                    [inputEntry.key]: {
                        connections,
                        value: undefined,
                    },
                },
            });

            this.blueprint.addComputedConnection(inputEntry.id);
            this.blueprint.addComputedConnection(outputEntry.id);

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

type FreeConnector = PIXI.Graphics & {
    origin: {
        color: ColorSource;
        entry?: BaseBlueprintEntry;
        position: Point;
        wasConnected: boolean;
    };
};

export { BlueprintConnectionsLayer };
