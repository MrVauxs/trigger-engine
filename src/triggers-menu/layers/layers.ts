import { Blueprint, BlueprintConnectionsLayer, BlueprintNodesLayer } from "triggers-menu";

class BlueprintLayers extends PIXI.Container {
    #connections: BlueprintConnectionsLayer;
    #nodes: BlueprintNodesLayer;

    constructor(parent: Blueprint) {
        super();

        this.addChild(
            (this.#connections = new BlueprintConnectionsLayer(parent)),
            (this.#nodes = new BlueprintNodesLayer(parent))
        );
    }

    _initialize() {
        this.#connections._initialize();
        this.#nodes._initialize();
    }
}

export { BlueprintLayers };
