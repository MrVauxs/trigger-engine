import { NodeFieldSchema } from "engine";
import { BuiltInEntryField } from ".";

class BooleanField extends BuiltInEntryField<boolean, BooleanFieldSchema> {
    static get defineSchema(): NodeFieldSchema {
        return {
            default: { type: "boolean" },
        };
    }

    get cursor(): PIXI.Cursor {
        return "pointer";
    }

    get height(): number {
        return this.maxHeight * 0.75;
    }

    get width(): number {
        return this.height;
    }

    get activeColor(): ColorSource {
        return 0xad0303;
    }

    draw(): void {
        if (this.isConnected) {
            this.beginFill(this.backgroundColor);
        } else if (this.value) {
            const check = this.createFontAwesomeIcon({ unicode: "\uf00c", fontWeight: "900", fontMult: 0.9 });

            check.anchor.set(0.5);
            check.x = this.width / 2;
            check.y = this.height / 2;

            this.addChild(check);
            this.beginFill(this.activeColor);
        }

        this.lineStyle({ color: this.borderColor, width: this.borderWidth });
        this.drawRect(0, 0, this.width, this.height);

        this.endFill();
    }

    async onClick(): Promise<boolean> {
        return !this.value;
    }
}

type BooleanFieldSchema = {
    default?: boolean;
};

export { BooleanField };
export type { BooleanFieldSchema };
