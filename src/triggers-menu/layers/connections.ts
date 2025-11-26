import { onceDecorator } from "module-helpers";
import { BlueprintLayer } from ".";

class BlueprintConnectionsLayer extends BlueprintLayer<PIXI.Graphics> {
    @onceDecorator()
    _initialize(): void {}
}

export { BlueprintConnectionsLayer };
