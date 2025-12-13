import { NodeBridge } from "engine";
import { localize } from "module-helpers";
import { BaseBlueprintEntry, EntryCategory } from ".";
import { BlueprintNode } from "..";

class BlueprintBridgeEntry extends BaseBlueprintEntry {
    #data: NodeBridge;

    constructor(parent: BlueprintNode, category: EntryCategory, data: NodeBridge) {
        super(parent, category);

        this.#data = data;
    }

    get key(): string {
        return this.#data.key;
    }

    get label(): string {
        const { key, label } = this.#data;

        if (label) {
            return game.i18n.localize(label);
        }

        if (this.isInput) {
            return this.node.localize("in") ?? localize("node.in");
        }

        return (
            this.node.localize("out", key) ?? //
            (key === "out" ? localize("node.out") : key)
        );
    }

    get color(): ColorSource {
        return 0xffffff;
    }

    _drawConnector(): PIXI.Graphics {
        const color = this.color;
        const connector = new PIXI.Graphics();

        if (this.isConnected) {
            connector.beginFill(color);
        }

        const left = this.isInput ? 1.5 : 0;
        const mid = 6 + left;
        const right = 12 + left;

        connector.lineStyle({ color, width: 1.5 });
        connector.moveTo(left, 0);
        connector.lineTo(mid, 0);
        connector.lineTo(right, 6);
        connector.lineTo(mid, 12);
        connector.lineTo(left, 12);
        connector.lineTo(left, 0);

        connector.endFill();

        return connector;
    }

    _drawField(): null {
        return null;
    }
}

export { BlueprintBridgeEntry };
