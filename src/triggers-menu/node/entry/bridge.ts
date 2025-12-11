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

    _drawConnector(connector: PIXI.Graphics) {
        connector.lineStyle({ color: this.color, width: 1 });
        connector.moveTo(0, 0);
        connector.lineTo(6, 0);
        connector.lineTo(12, 6);
        connector.lineTo(6, 12);
        connector.lineTo(0, 12);
        connector.lineTo(0, 0);
    }

    _drawField(): null {
        return null;
    }
}

export { BlueprintBridgeEntry };
