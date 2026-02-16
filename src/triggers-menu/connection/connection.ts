import { EntryId } from "engine";
import { calculateMidPoint } from "foundry-helpers";
import { BaseBlueprintEntry, BlueprintEntry, isBlueprintEntry } from "triggers-menu";
import { BlueprintConnectionsLayer } from ".";

class BlueprintConnection extends PIXI.Graphics {
    #convertor?: PIXI.Graphics;
    #origin: EntryId;
    #target: EntryId;

    constructor(origin: EntryId, target: EntryId) {
        super();

        this.#origin = origin;
        this.#target = target;

        this.eventMode = "static";
    }

    hasEntry(entry: BaseBlueprintEntry): boolean {
        const entryId = entry.id;
        return this.#origin === entryId || this.#target === entryId;
    }

    draw() {
        this.clear();

        const origin = this.parent.blueprint.nodes.getEntryFromId(this.#origin);
        const target = this.parent.blueprint.nodes.getEntryFromId(this.#target);
        if (!origin || !target) return;

        const originCenter = this.parent.fromPoint(origin.connectorCenter);
        const targetCenter = this.parent.fromPoint(target.connectorCenter);

        const halfPoint = drawCurvedLine(this, originCenter, targetCenter, [origin.color, target.color]);

        // we don't need a converter
        if (!isBlueprintEntry(origin) || origin.type === (target as BlueprintEntry).type) return;

        const convertorElement = (this.#convertor ??= this.#createConvertorElement(origin, target as BlueprintEntry));

        convertorElement.position.set(
            halfPoint.x - convertorElement.width / 2,
            halfPoint.y - convertorElement.height / 2,
        );

        this.addChild(convertorElement);
    }

    #createConvertorElement(origin: BlueprintEntry, target: BlueprintEntry): PIXI.Graphics {
        const padding = { x: 4, y: 2 };
        const convertorElement = new PIXI.Graphics();
        const icon = origin.node.fontAwesomeIcon({ unicode: "\uf0ec" });

        const width = icon.width + padding.x * 2;
        const height = icon.height + padding.y * 2;

        icon.position.set(padding.x, padding.y);

        convertorElement.beginFill(0x0, 0.5);
        convertorElement.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
        convertorElement.drawRoundedRect(0, 0, width, height, 4);
        convertorElement.endFill();

        convertorElement.addChild(icon);

        const [input, output] = origin.isInput ? [origin, target] : [target, origin];
        const convertor = origin.node.trigger.application.getConvertor(
            (output as BlueprintEntry).type,
            (input as BlueprintEntry).type,
        );

        const tooltip = convertor && origin.node.rootLocalize("convertor", `${convertor.output}-${convertor.input}`);
        if (tooltip) {
            origin.node.blueprint.addTooltip(convertorElement, () => tooltip, "UP");
        }

        return convertorElement;
    }
}

/**
 * @returns halfPoint between origin & target
 */
function drawCurvedLine(
    graphics: PIXI.Graphics,
    origin: Point,
    target: Point,
    colors: [ColorSource] | [ColorSource, ColorSource],
): Point {
    const halfPoint = calculateMidPoint(origin, target);

    const changeLineStyle = (colorIndex: 0 | -1) => {
        const lineOptions = {
            alignment: 0.5,
            cap: PIXI.LINE_CAP.ROUND,
            color: colors.at(colorIndex),
            smooth: true,
            width: 6,
        } satisfies PIXI.ILineStyleOptions & { smooth: boolean };

        graphics.lineStyle(lineOptions);
    };

    graphics.moveTo(origin.x, origin.y);
    changeLineStyle(0);
    graphics.quadraticCurveTo((origin.x + halfPoint.x) / 2, origin.y, halfPoint.x, halfPoint.y);
    changeLineStyle(-1);
    graphics.quadraticCurveTo((halfPoint.x + target.x) / 2, target.y, target.x, target.y);

    return halfPoint;
}

interface BlueprintConnection {
    parent: BlueprintConnectionsLayer;
}

export { BlueprintConnection, drawCurvedLine };
