import { NodeFieldSchema } from "engine";
import { PointInputElement } from "triggers-menu";
import { InputField } from ".";

class PointField extends InputField<Point, PointFieldSchema> {
    static get defineSchema(): NodeFieldSchema {
        return {
            x: { type: "number" },
            y: { type: "number" },
            step: { type: "number" },
        };
    }

    get fontSize(): number {
        return this.baseFontSize * 0.9;
    }

    get width(): number {
        return 120;
    }

    get targetWidth(): number {
        return this.width * 2;
    }

    get toDisplay(): string {
        return String(this.value.x);
    }

    draw(): void {
        const halfWidth = this.width / 2;

        for (const key of ["x", "y"] as const) {
            const padding = this.innerPadding;
            const labelElement = this.createPreciseText(key.capitalize(), {
                fontSize: this.fontSize,
                lineHeight: this.lineHeight,
            });

            labelElement.x = key === "x" ? 0 : halfWidth;

            this.addChild(labelElement);

            const fieldOffset = labelElement.x + labelElement.width + padding;
            const fieldWidth = halfWidth - labelElement.width - padding * 2;

            if (this.isConnected) {
                this.beginFill(this.backgroundColor);
            } else {
                const valueElement = this.createPreciseText(String(this.value[key]), {
                    fontSize: this.fontSize,
                    lineHeight: this.lineHeight,
                });

                valueElement.x = fieldOffset + padding;
                valueElement.alpha = this.valueAlpha;

                this.addRectangleMask(valueElement, 0, 0, fieldWidth - this.innerPadding * 2, this.height);
                this.addChild(valueElement);
            }

            this.lineStyle({ color: this.borderColor, width: this.borderWidth });
            this.drawRect(fieldOffset, 0, fieldWidth, this.height);

            this.endFill();
        }

        this.label.width = 0;
        this.addChild(this.label);
    }

    createInput(): HTMLInputElement {
        return new PointInputElement({
            name: "field",
            value: this.value,
            step: this.field.step ?? 0,
        }) as any;
    }

    afterRender(input: PointInputElement): void {
        input.focus();
    }

    afterAnimation(input: PointInputElement): void {
        input._primaryInput.select();
    }

    activateEventListeners(input: PointInputElement, returnValue: (value: Point) => Promise<void>): void {
        input.addEventListener("blur", () => returnValue(input.value), { once: true });
    }
}

type PointFieldSchema = {
    x?: number;
    y?: number;
    step?: number;
};

export { PointField };
export type { PointFieldSchema };
