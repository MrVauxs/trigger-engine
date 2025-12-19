import { BaseBlueprintEntry } from "triggers-menu";

abstract class BaseBlueprintConnection extends PIXI.Container {
    declare readonly origin: Point;
    declare readonly target: Point;

    constructor(origin: Point, target: Point) {
        super();

        this.origin = { x: origin.x, y: origin.y };
        this.target = { x: target.x, y: target.y };

        Object.freeze(this.origin);
        Object.freeze(this.target);
    }

    draw() {}
}

class FreeBlueprintConnection extends BaseBlueprintConnection {
    constructor(origin: BaseBlueprintEntry) {
        super(origin.position, origin.position);
    }

    moveTarget({ x, y }: Point) {
        this.target.x = x;
        this.target.y = y;
    }
}

export { FreeBlueprintConnection };
