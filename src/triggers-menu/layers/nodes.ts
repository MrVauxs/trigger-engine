import { onceDecorator } from "module-helpers";
import { BlueprintLayer } from ".";

class BlueprintNodesLayer extends BlueprintLayer<PIXI.Container> {
    @onceDecorator()
    _initialize(): void {
        const test = new PIXI.Graphics();

        test.beginFill(0xff0000, 1);
        test.drawRect(100, 100, 200, 200);
        test.endFill();

        this.addChild(test);
    }
}

export { BlueprintNodesLayer };
