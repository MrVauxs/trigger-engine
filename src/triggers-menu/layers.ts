import { dividePointBy, subtractPoint } from "module-helpers";
import { Blueprint, BlueprintConnectionsLayer, BlueprintNodesLayer } from ".";

class BlueprintLayers extends PIXI.Container {
    #blueprint: Blueprint;
    #connections: BlueprintConnectionsLayer;
    #nodes: BlueprintNodesLayer;

    constructor(blueprint: Blueprint) {
        super();

        this.#blueprint = blueprint;

        this.addChild(
            (this.#connections = new BlueprintConnectionsLayer(blueprint)),
            (this.#nodes = new BlueprintNodesLayer())
        );
    }

    get connections(): BlueprintConnectionsLayer {
        return this.#connections;
    }

    get nodes(): BlueprintNodesLayer {
        return this.#nodes;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    clear() {
        this.#connections.clear();
        this.#nodes.clear();
    }

    fromPoint(point: Point): Point {
        return subtractPoint(dividePointBy(point, this.blueprint.scale), this);
    }
}

export { BlueprintLayers };
