import { Blueprint } from "..";

abstract class BlueprintLayer<T extends PIXI.DisplayObject> extends PIXI.Container<T> {
    #parent: Blueprint;

    constructor(parent: Blueprint) {
        super();

        this.#parent = parent;
    }

    get blueprint(): Blueprint {
        return this.#parent;
    }

    abstract _initialize(): void;
}

export { BlueprintLayer };
