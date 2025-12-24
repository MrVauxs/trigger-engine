import { z } from "module-helpers";
import { BuiltInEntryField } from ".";

class BooleanField extends BuiltInEntryField<boolean, BooleanFieldSchema> {
    static get defineSchema(): z.core.JSONSchema.ObjectSchema {
        return {
            type: "object",
            properties: {
                default: { type: "boolean" },
            },
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
        if (this.isConnected || this.value) {
            this.beginFill(this.isConnected ? this.backgroundColor : this.activeColor);
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
