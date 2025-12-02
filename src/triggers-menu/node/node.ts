import { NodeIconObject, TriggerNode } from "engine";
import { R } from "module-helpers";

class BlueprintNode extends PIXI.Container {
    #node: TriggerNode;

    constructor(node: TriggerNode) {
        super();

        this.#node = node;
    }

    get fontSize(): number {
        return 15;
    }

    get outerPadding(): Point {
        return { x: 10, y: 4 };
    }

    get opacity(): number {
        return 0.6;
    }

    draw() {
        const header = this.#drawHeader();

        let height = 0;
        let width = 0;

        if (header) {
            const color = new PIXI.Color(header.background ?? 0x0);

            header.beginFill(color, this.opacity);
            header.drawRect(0, 0, header.calculatedWith, header.calculatedHeight);
            header.endFill();

            height += header.calculatedHeight;
            width += header.calculatedWith;

            this.addChild(header);
        }

        const { x, y } = this.#node.getPosition();
        this.position.set(x, y);
    }

    fontAwesomeIcon(icon: unknown, fontSize?: number): PreciseText | undefined {
        icon = R.isString(icon) ? { unicode: icon } : icon;
        if (!R.isPlainObject(icon) || !R.isString(icon?.unicode)) return;

        const fontWeight = (R.isString(icon.fontWeight) && icon.fontWeight) || "400";

        return this.preciseText(icon.unicode, {
            fontFamily: "Font Awesome 6 Pro",
            fontWeight: fontWeight as TextStyleFontWeight,
            fontSize,
        });
    }

    preciseText(text: unknown, options: Partial<PIXI.ITextStyle> = {}): PreciseText | undefined {
        if (!R.isString(text)) return;

        if (!R.isNumber(options.fontSize)) {
            delete options.fontSize;
        }

        const style = new PIXI.TextStyle(
            foundry.utils.mergeObject(
                {
                    fontFamily: "Signika",
                    fontSize: this.fontSize,
                    fontStyle: "normal",
                    fontWeight: "normal",
                    fill: "#ffffff",
                    stroke: "#111111",
                    strokeThickness: 0,
                    dropShadow: true,
                    dropShadowColor: "#000000",
                    dropShadowBlur: 2,
                    dropShadowAngle: 0,
                    dropShadowDistance: 0,
                    wordWrap: false,
                    wordWrapWidth: 100,
                    lineJoin: "miter",
                },
                options
            )
        );

        return new foundry.canvas.containers.PreciseText(text, style);
    }

    #drawHeader(): NodeHeader | undefined {
        const data = this.#node.header;
        const title = this.preciseText(data?.title);
        if (!data || !title) return;

        const spacing = 5;
        const padding = this.outerPadding;
        const header = new PIXI.Graphics() as NodeHeader;
        const icon = this.fontAwesomeIcon(data.icon);
        const subtitle = this.preciseText(data.subtitle, {
            fontSize: this.fontSize * 0.93,
            fontStyle: "italic",
            fill: "d9d9d9",
        });

        const rowHeight = Math.max(icon?.height ?? 0, title.height);

        let height = padding.y + title.height;

        if (icon) {
            icon.x = padding.x;
            icon.y = padding.y + (rowHeight - icon.height) / 2;

            title.x = icon.x + icon.width + spacing;

            header.addChild(icon);
        } else {
            title.x = padding.x;
        }

        title.y = padding.y + (rowHeight - title.height) / 2;

        header.addChild(title);

        if (subtitle) {
            subtitle.x = title.x + (icon ? 0 : 2);
            subtitle.y = height;

            height += subtitle.height;

            header.addChild(subtitle);
        }

        const maxWidth = Math.max(
            title.x + title.width,
            (subtitle?.x ?? 0) + (subtitle?.width ?? 0)
        );

        header.background = data.background;
        header.calculatedHeight = height + padding.y;
        header.calculatedWith = maxWidth + padding.x;

        return header;
    }
}

type NodeHeader = PIXI.Graphics & {
    background?: `#${string}` | number;
    calculatedHeight: number;
    calculatedWith: number;
};

type IconObject = WithRequired<NodeIconObject, "unicode">;

export { BlueprintNode };
