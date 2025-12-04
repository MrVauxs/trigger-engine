import { BlueprintConnectionsLayer, BlueprintNodesLayer } from ".";

class BlueprintLayers extends PIXI.Container {
    #connections: BlueprintConnectionsLayer;
    #nodes: BlueprintNodesLayer;

    constructor() {
        super();

        this.addChild(
            (this.#connections = new BlueprintConnectionsLayer()),
            (this.#nodes = new BlueprintNodesLayer())
        );
    }

    get connections(): BlueprintConnectionsLayer {
        return this.#connections;
    }

    get nodes(): BlueprintNodesLayer {
        return this.#nodes;
    }

    clear() {
        this.#connections.clear();
        this.#nodes.clear();
    }

    activateListeners() {}

    disableListeners() {}
}

export { BlueprintLayers };
